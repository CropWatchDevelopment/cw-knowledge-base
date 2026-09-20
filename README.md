# CropWatch Knowledge Base

A multilingual help site for CropWatch hardware, software, gateways and concepts. Built with SvelteKit 3 and Svelte 5, styled with the CropWatch light theme, deployed on Vercel.

There is no database. Every page is a JSON file under `static/content/`, and the site is prerendered from those files at build time. In the browser, moving between pages fetches the same JSON directly.

## Commands

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm check        # type check
pnpm lint         # prettier + eslint
pnpm test:unit    # vitest, includes a consistency check of static/content
pnpm build        # prerenders every page, output for Vercel
pnpm editor       # the local content editor (see "Editing the content")
```

## URLs

| Address                                     | Page                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `/`                                         | Redirects to `/en` or `/ja` from the browser's `Accept-Language` header |
| `/en`                                       | Home: search, topics, featured guides                                   |
| `/en/gateways`                              | One topic and its guides                                                |
| `/en/gateways/installing-a-gateway`         | One guide                                                               |
| `/en/gateways/installing-a-gateway#connect` | One section of a guide                                                  |
| `/en/search?q=antenna`                      | Search results                                                          |

Section anchors (`#connect`) come from the `id` of the section in the JSON. They are the same in every language, so a link shared in English opens the same section in Japanese.

## How the code is organised

The code follows a model, view, controller split. Routes stay thin: a `+page.ts` calls a controller and a `+page.svelte` renders views.

```
src/
  params.ts                  # [lang=lang] only matches a supported language
  hooks.server.ts            # writes <html lang> from the URL
  lib/
    models/                  # data and rules. No Svelte, no SvelteKit.
      content.ts             #   types for the JSON files
      content-repository.ts  #   reads index.json and pages/<slug>.json
      locale.ts              #   languages, fallback to English, Accept-Language
      messages.ts            #   the site's own words (buttons, labels) per language
      search.ts              #   search index and ranking
      video.ts               #   YouTube link parsing
    controllers/             # turn models into exactly what a view needs
      shell.controller.ts    #   menu, search entries (layout)
      home.controller.ts     #   featured and popular guides
      topic.controller.ts    #   one topic
      article.controller.ts  #   one guide: localized text, resolved links, video id
      search-box.svelte.ts   #   state for search fields (class with runes)
      scroll-spy.svelte.ts   #   which section is being read
      link-copier.svelte.ts  #   copy-to-clipboard with a short confirmation
      locale-context.ts      #   current language and messages, via context
    views/                   # Svelte components. Props in, markup out.
      layout/  home/  article/  shared/
  routes/
    +page.server.ts          # language redirect (the only non-prerendered route)
    [lang=lang]/             # +layout loads the shell once per language
      +page                  # home
      search/+page
      [topic]/+page
      [topic]/[slug]/+page
```

Models are covered by unit tests (`*.spec.ts` beside each file). `content.spec.ts` reads the real files in `static/content/` and fails if a page is missing, a link points nowhere, or two sections share an anchor.

The editor in `editor/` is a second SvelteKit app with the same split, and imports this app's models through `editor/src/lib/site.ts` so the two can never disagree about the content format. Its own models (drafts, slugs, rich text, index updates) are tested too; `pnpm test:unit` runs both sets.

## Content format

`static/content/index.json` holds what the menu, home page and search need:

```jsonc
{
	"topics": [
		{
			"id": "gateways", // URL segment
			"icon": "gateway", // hardware | software | gateway | concepts
			"title": { "en": "Gateways", "ja": "ゲートウェイ" },
			"description": { "en": "…", "ja": "…" },
			"pages": ["installing-a-gateway"] // slugs, in menu order
		}
	],
	"pages": {
		"installing-a-gateway": {
			"topic": "gateways",
			"title": { "en": "Installing a gateway", "ja": "ゲートウェイの設置" },
			"summary": { "en": "…", "ja": "…" },
			"image": null, // card picture, e.g. "images/gateway.jpg"
			"hasVideo": false,
			"keywords": { "en": ["antenna"], "ja": ["アンテナ"] }
		}
	},
	"featured": ["installing-a-gateway"], // "Start here" on the home page
	"popular": ["installing-a-gateway"] // quick links under the search box
}
```

`static/content/pages/<slug>.json` holds one guide in every language:

```jsonc
{
	"slug": "installing-a-gateway",
	"topic": "gateways",
	"title": { "en": "…", "ja": "…" },
	"intro": { "en": "…", "ja": "…" },
	"sections": [
		{
			"id": "connect", // the #anchor. Lowercase words joined by hyphens.
			"heading": { "en": "…", "ja": "…" },
			"body": {
				"en": [
					{
						"type": "paragraph",
						"content": [
							{ "text": "See " },
							{ "text": "this guide", "href": "page:what-is-lorawan#what-affects-range" }
						]
					},
					{
						"type": "list",
						"ordered": true,
						"items": [[{ "text": "First step" }], [{ "text": "Second step" }]]
					},
					{ "type": "note", "content": [{ "text": "Keep the gateway powered.", "bold": true }] }
				]
			},
			"image": {
				// optional
				"src": "images/ports.jpg", // relative to static/content/, or null until the photo exists
				"alt": { "en": "…" },
				"caption": { "en": "…" },
				"side": "right", // left | right on wide screens; always above the text on a phone
				"width": 1200,
				"height": 776
			}
		}
	],
	"links": [
		// optional, shown as "Related links"
		{ "kind": "page", "slug": "what-is-lorawan" },
		{ "kind": "url", "href": "https://www.cropwatch.io", "label": { "en": "CropWatch website" } }
	],
	"video": { "url": "https://www.youtube.com/watch?v=VIDEO_ID" } // optional, shown last
}
```

Rules the site relies on:

- `en` is required wherever text is localized. A missing or empty `ja` value falls back to English field by field. If the title has no Japanese, the guide shows a notice that it is not translated yet.
- A text run's `href` is either a web address or `page:<slug>` / `page:<slug>#<section-id>`. Page links resolve to the reader's language. A link to a page that no longer exists renders as plain text.
- `related-links` and `video` are reserved anchors; do not use them as section ids.
- Set `hasVideo` in `index.json` to match whether the page file has a `video`. The tests check this.
- The YouTube player loads only after the reader presses play. Before that the page shows a thumbnail and sends nothing to YouTube.

## Editing the content

Use the editor in `editor/`. It runs on this computer, writes these JSON files for you, and is never deployed.

```sh
pnpm editor        # http://localhost:5174, also reachable on the local network
pnpm dev           # run the website beside it, so Preview works
```

It has no login. It answers requests from this computer and the local network only, and refuses anything else, so do not forward its port or put it behind a public address.

What it does:

- **Pages** lists every page with its translation state, and whether it differs from the website. Pages are created, reordered, and deleted here.
- **Edit a page** is a form: title, introduction, then sections with a heading, a picture and text. The text has bold, italic, lists, callouts and links; a link to another guide is chosen from a list, so it can never point at a page that does not exist.
- **English / 日本語** switches which language you are writing. Untranslated boxes show the English text in grey, and each section can show the English text underneath.
- **Pictures** are resized to 1600px, saved as WebP in `static/content/images/<page>/`, and the first one becomes the page's card picture. Pictures that are replaced or removed are deleted from the project when the page is saved.
- **Section links** (`#connect`) are made from the English heading for a new section, and never change afterwards, so links people already have keep working. The same holds for a page's address once it has a picture or has been saved.
- **Save page** writes `static/content/pages/<slug>.json` and updates `index.json`. It refuses to save until anything missing is filled in, and says what it is.
- **Publish to website** commits `static/content` and pushes it, which makes Vercel rebuild. The button says how many files differ; it is disabled until the project is in git with a remote.

### Editing the files by hand instead

1. Create `static/content/pages/<slug>.json`.
2. Add the slug to a topic's `pages` list and to `pages` in `index.json`.
3. Put pictures in `static/content/images/`.
4. Run `pnpm test:unit`, then commit and push. Vercel rebuilds the site.

## Adding a language

Add the code to `LOCALES` and `LOCALE_INFO` in `src/lib/models/locale.ts`, then add a block to `src/lib/models/messages.ts`. TypeScript reports every label that is still missing. Content files need no structural change: add the new language key next to `en` and `ja`.

## Deployment

The project uses `@sveltejs/adapter-vercel`. All pages are static files; `/` is one small serverless function for the language redirect. `vite.config.ts` reads `VERCEL_PROJECT_PRODUCTION_URL` during the build so the `hreflang` links carry the production domain.

Outbound links (app, support) are in `src/lib/models/site.ts`.
