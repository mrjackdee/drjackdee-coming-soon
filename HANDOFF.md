# DrJackDee.com Handoff Notes

## Build approach

This site is a lightweight static implementation built with plain HTML, CSS, and JavaScript so it can deploy cleanly to both Vercel and Hostinger with no framework dependency.

## Files

- `index.html`: page structure, SEO metadata, structured data
- `styles.css`: responsive layout, visual system, motion, and accessibility states
- `script.js`: reveal animations and launch-notification form behavior
- `favicon.svg`: site favicon
- `og-image.svg`: editable social preview artwork
- `og-image.png`: generated PNG social image for Open Graph and Twitter cards
- `site.webmanifest`, `robots.txt`, `sitemap.xml`: launch-ready metadata files

## Email capture

The launch form is integration-ready.

- Current behavior:
  - If a form endpoint is added to the `data-endpoint` attribute on `#notify-form`, the page sends a JSON payload with `email` and `source`.
  - If no endpoint is configured, the page opens a pre-addressed email draft to `advisory@donoraglobal.com`.

- Recommended next integrations:
  - Mailchimp embedded endpoint
  - ConvertKit form endpoint
  - HubSpot or HighLevel webhook
  - Google Form Apps Script webhook

## Social links

Verified current links used on the page:

- `https://www.mrjackdee.com/`
- `https://www.donoraglobal.com/`
- `mailto:advisory@donoraglobal.com`
- `https://www.linkedin.com/in/mrjackdee/`
- `https://x.com/MrKreducator/`

Instagram, Facebook, and YouTube are currently presented as launch-phase placeholders because I did not find reliable public URLs to wire in without guessing.

## Deployment

### Vercel

Because this is a static site, deploy by pointing Vercel at the project folder. No build command is required.

- Framework preset: `Other`
- Build command: leave blank
- Output directory: leave blank

### Hostinger

Upload the project files directly to the domain root or `public_html`.

## Future expansion

When this evolves beyond a coming soon page, the easiest paths are:

1. Keep the static shell and expand into a multi-page site.
2. Migrate into Next.js only when CMS integration, blogging, or dynamic lead capture becomes necessary.

## Metadata note

Canonical and sitemap URLs are set to `https://www.drjackdee.com/`. If the site is shared on a temporary Vercel URL before the production domain is attached, social previews may still reference the future production domain until those tags are updated.
