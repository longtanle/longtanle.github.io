# Introduction

This website started from the Arlo Personal Portfolio Resume Template and is being adapted into a more maintainable personal academic website.

# Content updates

The site now keeps publication and project content in structured JSON files:

- `data/publications.json`
- `data/projects.json`

The homepage and publications page render from those files through `js/content.js`.

# ORCID publication sync

Publications can be refreshed automatically from the ORCID public record:

- ORCID iD: `0000-0003-3284-1990`
- Config file: `data/orcid.json`
- Sync script: `scripts/sync-orcid-publications.mjs`
- GitHub Actions workflow: `.github/workflows/sync-orcid-publications.yml`

The sync job is designed to preserve hand-curated fields already present in `data/publications.json`, especially:

- `selected`
- `field`
- custom `links`

So ORCID becomes the source of truth for core bibliography metadata, while the repo still controls what is featured on the site.

# Manual run

You can run the sync locally with:

```bash
node scripts/sync-orcid-publications.mjs
```
