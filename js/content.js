(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderLinks(links) {
    if (!Array.isArray(links) || !links.length) return "";

    var seen = {};
    var uniqueLinks = links.filter(function (link) {
      var key = (link.label || "") + "|" + (link.url || "");
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
    var paperCount = uniqueLinks.filter(function (link) { return link.label === "Paper"; }).length;
    var paperIndex = 0;

    return '<div class="publication_links">' + uniqueLinks.map(function (link) {
      var label = link.label;
      if (label === "Paper" && paperCount > 1) {
        paperIndex += 1;
        label = paperIndex === 1 ? "DOI" : "Publisher";
      }
      return '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(label) + '<span aria-hidden="true"> ↗</span></a>';
    }).join("") + "</div>";
  }

  function sortPublications(items) {
    return items.slice().sort(function (a, b) {
      if (b.year !== a.year) return b.year - a.year;
      return (a.title || "").localeCompare(b.title || "");
    });
  }

  function highlightAuthor(authors) {
    return escapeHtml(authors || "").replace(/Long Tan Le/g, "<strong>Long Tan Le</strong>");
  }

  function publicationCard(item) {
    return [
      '<article class="publication_card">',
      '<div class="publication_meta">',
      '<span class="publication_year">' + escapeHtml(item.year) + "</span>",
      '<span>' + escapeHtml(item.type) + "</span>",
      '<span>' + escapeHtml(item.field) + "</span>",
      "</div>",
      '<h4 class="publication_title">' + escapeHtml(item.title) + "</h4>",
      '<p class="publication_authors">' + highlightAuthor(item.authors) + "</p>",
      '<p class="publication_venue">' + escapeHtml(item.venue) + "</p>",
      renderLinks(item.links),
      "</article>"
    ].join("");
  }

  function renderPublications(items, targetId, selectedOnly) {
    var target = document.getElementById(targetId);
    if (!target) return;

    var filtered = sortPublications(items).filter(function (item) {
      return selectedOnly ? item.selected : true;
    });

    if (selectedOnly) {
      target.innerHTML = filtered.map(publicationCard).join("");
      return;
    }

    target.innerHTML = [
      '<div class="publication_toolbar">',
      '<label for="publication-search">Search publications</label>',
      '<input id="publication-search" type="search" placeholder="Title, author, venue, or topic">',
      '<span class="publication_count">' + filtered.length + " publications</span>",
      "</div>",
      '<div class="publication_results">' + filtered.map(publicationCard).join("") + "</div>"
    ].join("");

    var search = document.getElementById("publication-search");
    var results = target.querySelector(".publication_results");
    var count = target.querySelector(".publication_count");
    search.addEventListener("input", function () {
      var query = search.value.trim().toLowerCase();
      var matches = filtered.filter(function (item) {
        return [item.title, item.authors, item.venue, item.field, item.type, item.year].join(" ").toLowerCase().indexOf(query) !== -1;
      });
      results.innerHTML = matches.map(publicationCard).join("");
      count.textContent = matches.length + (matches.length === 1 ? " publication" : " publications");
    });
  }

  function cleanVenue(item) {
    var venue = String(item.venue || "")
      .replace(/^Proceedings of the\s+/i, "")
      .replace(/,\s*\d{4}\.?\s*$/, "")
      .trim();
    return venue && venue.toLowerCase() !== "conference" ? venue : "a peer-reviewed conference";
  }

  function renderRecentHighlights(items) {
    var target = document.getElementById("recent-highlights");
    if (!target) return;

    var recent = sortPublications(items).filter(function (item) {
      return /^(Long Tan Le|L\.?\s*T\.?\s*Le)\b/i.test(String(item.authors || "").trim());
    }).slice(0, 3);

    var publicationHighlights = recent.map(function (item) {
      var type = String(item.type || "Publication");
      var action = /conference/i.test(type) ? "Presented at" : "Published in";
      var iconClass = /conference/i.test(type) ? "fa-users" : (/book/i.test(type) ? "fa-book" : "fa-file-text-o");
      var link = Array.isArray(item.links) ? item.links.find(function (candidate) {
        return candidate && candidate.url && candidate.label === "Paper";
      }) || item.links.find(function (candidate) { return candidate && candidate.url; }) : null;
      var title = escapeHtml(item.title || "Untitled publication");
      var linkedTitle = link
        ? '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + title + '<span aria-hidden="true"> ↗</span></a>'
        : title;

      return [
        '<article class="highlight_item">',
        '<div class="highlight_icon" aria-hidden="true"><i class="fa ' + iconClass + '"></i></div>',
        '<div class="highlight_content">',
        '<div class="highlight_meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(type) + "</span></div>",
        "<h5>" + linkedTitle + "</h5>",
        '<p>' + action + " <strong>" + escapeHtml(cleanVenue(item)) + "</strong>.</p>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");

    target.innerHTML = [
      '<div class="highlights_header">',
      "<h4><span>Recent Highlights</span></h4>",
      "<p>Recent publications and career milestones.</p>",
      "</div>",
      '<div class="highlights_list">',
      publicationHighlights,
      '<article class="highlight_item highlight_milestone">',
      '<div class="highlight_icon" aria-hidden="true"><i class="fa fa-graduation-cap"></i></div>',
      '<div class="highlight_content">',
      '<div class="highlight_meta"><span>2025</span><span>Milestone</span></div>',
      "<h5>Completed my PhD in Computer Science</h5>",
      "<p>Successfully completed at <strong>The University of Sydney</strong>.</p>",
      "</div>",
      "</article>",
      "</div>"
    ].join("");
  }

  function renderProjectLinks(links) {
    if (!Array.isArray(links) || !links.length) return "";

    return '<div class="arlo_tm_popup_share_wrap"><ul>' +
      links.map(function (link) {
        return '<li><a href="' + escapeHtml(link.url) + '">' + escapeHtml(link.label) + "</a></li>";
      }).join("") +
      "</ul></div>";
  }

  function renderVisibleProjectLinks(links) {
    if (!Array.isArray(links) || !links.length) return "";
    return '<div class="project_links">' + links.map(function (link) {
      return '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.label) + '<span aria-hidden="true"> ↗</span></a>';
    }).join("") + "</div>";
  }

  function renderProjects(items) {
    var target = document.getElementById("projects-list");
    if (!target) return;

    target.innerHTML = items.map(function (item, index) {
      var delay = index % 2 === 1 ? ' data-wow-delay="0.2s"' : "";

      return [
        '<li class="wow fadeInUp" data-wow-duration="1.2s"' + delay + ">",
        '<div class="inner_list">',
        '<div class="image_wrap">',
        '<img class="small" src="' + escapeHtml(item.thumbnail) + '" alt="' + escapeHtml(item.title) + '"/>',
        '<div class="news_image" data-url="' + escapeHtml(item.thumbnail) + '"></div>',
        "</div>",
        '<div class="definitions_wrap">',
        '<div class="date_wrap"><p><span>' + escapeHtml(item.period) + '</span><span class="project_category">' + escapeHtml(item.category) + "</span></p></div>",
        '<div class="title_holder"><h3>' + escapeHtml(item.title) + "</h3></div>",
        '<div class="definition"><p>' + escapeHtml(item.summary) + "</p></div>",
        '<div class="full_def"><img style="display: block; margin-left: auto; margin-right: auto;" src="' + escapeHtml(item.popupImage) + '" alt="' + escapeHtml(item.title) + '" width="400" /><p></p><p>' + escapeHtml(item.description) + "</p></div>",
        renderProjectLinks(item.links),
        renderVisibleProjectLinks(item.links),
        '<div class="read_more"><a href="#"><span>Project details</span></a></div>',
        "</div></div></li>"
      ].join("");
    }).join("");

    if (typeof window.arlo_tm_popup_blog === "function") {
      if (window.jQuery) {
        window.jQuery("#arlo_tm_popup_blog .inner_popup").empty();
      }
      window.arlo_tm_popup_blog();
    }
  }

  function loadJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadJson("data/publications.json?v=2")
      .then(function (items) {
        renderPublications(items, "selected-publications-list", true);
        renderPublications(items, "all-publications-list", false);
        renderRecentHighlights(items);
      })
      .catch(function (error) {
        console.error(error);
      });

    loadJson("data/projects.json")
      .then(function (items) {
        renderProjects(items);
      })
      .catch(function (error) {
        console.error(error);
      });
  });
})();
