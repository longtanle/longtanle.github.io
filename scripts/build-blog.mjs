import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const contentDir = join(root, "content", "blog");
const outputDir = join(root, "blog");

function escapeHtml(value = "") {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Every blog post needs YAML-style frontmatter.");
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    metadata[key] = value;
  }
  metadata.tags = (metadata.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  return { metadata, body: match[2].trim() };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (listType) html.push(`</${listType}>`);
    listType = null;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph(); closeList();
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) { closeList(); html.push(`<${nextType}>`); listType = nextType; }
      html.push(`<li>${inline((unordered || ordered)[1])}</li>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph(); closeList();
      html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph(); closeList();
  if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return html.join("\n");
}

function readableDate(date) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function pageTemplate({ title, description, siteRoot = "", content }) {
  return `<!DOCTYPE html>
<html lang="en"${siteRoot ? ` data-site-root="${siteRoot}"` : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(description)}">
<title>${escapeHtml(title)} | Long Tan Le</title>
<link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700,800" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700" rel="stylesheet">
<link rel="stylesheet" href="${siteRoot}css/plugins.css">
<link rel="stylesheet" href="${siteRoot}css/style.css">
<link rel="stylesheet" href="${siteRoot}css/professional.css?v=8">
<link rel="stylesheet" href="${siteRoot}css/blog-cv.css?v=2">
</head>
<body>
<div class="arlo_tm_wrapper_all">
  <div data-site-shell="mobile-header"></div>
  <div class="arlo_tm_content">
    <div data-site-shell="sidebar"></div>
    <main class="arlo_tm_rightpart"><div class="rightpart_inner">${content}</div></main>
    <a class="arlo_tm_totop" href="#" aria-label="Back to top"></a>
  </div>
</div>
<script src="${siteRoot}js/jquery.js"></script>
<script src="${siteRoot}js/plugins.js?v=2"></script>
<script src="${siteRoot}js/init.js"></script>
<script src="${siteRoot}js/site-shell.js?v=8"></script>
</body>
</html>`;
}

const files = (await readdir(contentDir)).filter((file) => file.endsWith(".md"));
const posts = [];

for (const file of files) {
  const source = await readFile(join(contentDir, file), "utf8");
  const { metadata, body } = parseFrontmatter(source);
  const slug = metadata.slug || basename(file, ".md");
  if (!metadata.title || !metadata.date || !metadata.summary) throw new Error(`${file}: title, date, and summary are required.`);
  const words = body.split(/\s+/).filter(Boolean).length;
  posts.push({ ...metadata, slug, body, html: markdownToHtml(body), readTime: Math.max(1, Math.ceil(words / 200)) });
}

posts.sort((a, b) => b.date.localeCompare(a.date));
await mkdir(outputDir, { recursive: true });

for (const post of posts) {
  const tags = post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const content = `<section class="academic_page"><div class="container article_shell">
    <a class="article_back" href="../blog.html">← All notes</a>
    <header class="article_header page_hero"><div>
      <span class="page_eyebrow">Research notes</span>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="article_meta"><span>${readableDate(post.date)}</span><span>${post.readTime} min read</span><div class="blog_tags">${tags}</div></div>
    </div></header>
    <article class="article_body">${post.html}</article>
  </div></section>`;
  await writeFile(join(outputDir, `${post.slug}.html`), pageTemplate({ title: post.title, description: post.summary, siteRoot: "../", content }));
}

const cards = posts.map((post) => `<article class="blog_card">
  <div class="blog_card_meta"><span class="blog_date">${readableDate(post.date)}</span><div class="blog_tags">${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></div>
  <div><h2><a href="blog/${post.slug}.html">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.summary)}</p></div>
  <a class="blog_arrow" href="blog/${post.slug}.html" aria-label="Read ${escapeHtml(post.title)}">→</a>
</article>`).join("\n");

const indexContent = `<section class="academic_page"><div class="container">
  <header class="page_hero"><div><span class="page_eyebrow">Blog</span><h1>Research notes &amp; field lessons</h1><p>Practical ideas from machine learning, distributed systems, data science, and the work of turning research into dependable tools.</p></div></header>
  <div class="blog_grid">${cards || '<div class="blog_empty"><h2>Notes are coming soon.</h2><p>New articles will appear here.</p></div>'}</div>
</div></section>`;

await writeFile(join(root, "blog.html"), pageTemplate({ title: "Blog", description: "Research notes and practical lessons from Long Tan Le.", content: indexContent }));
console.log(`Built ${posts.length} blog post${posts.length === 1 ? "" : "s"}.`);
