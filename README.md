# CropWatch Knowledge Base

A multilingual help site for CropWatch hardware, software, gateways and concepts. Built with SvelteKit 3 and Svelte 5, styled with the CropWatch light theme, deployed on Vercel.

- **Live site:** https://cw-knowledge-base.vercel.app
- **Repository:** https://github.com/CropWatchDevelopment/cw-knowledge-base
- **Vercel project:** `cw-knowledge-base`, in the CropWatch Team

There is no database. Every page is a JSON file under `static/content/<lang>/`, and the site is prerendered from those files at build time. In the browser, moving between pages fetches the same JSON directly.

Each language is a separate tree. A guide written in English exists only on the English site until somebody writes the Japanese one, and the reverse; nothing falls back across languages.

GitHub holds the content as well as the code: every push to `main` makes Vercel rebuild and deploy, so publishing a page and backing it up are the same action. Past versions of a page can be recovered from the repository's history.

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

Section anchors (`#connect`) come from the `id` of the section in the JSON. Both languages keep the same ones, so a link shared in English opens the same section in Japanese when that translation exists.

## How the code is organised

The code follows a model, view, controller split. Routes stay thin: a `+page.ts` calls a controller and a `+page.svelte` renders views.

```
src/
  params.ts                  # [lang=lang] only matches a supported language
  hooks.server.ts            # writes <html lang> from the URL
  lib/
    models/                  # data and rules. No Svelte, no SvelteKit.
      content.ts             #   types for the JSON files
      content-repository.ts  #   reads <lang>/index.json and <lang>/pages/<slug>.json
      locale.ts              #   languages, Accept-Language
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

```
static/content/
├── en/
│   ├── index.json
│   └── pages/<slug>.json
├── ja/
│   ├── index.json
│   └── pages/<slug>.json
└── images/<slug>/…        # shared: both languages point at the same files
```

`static/content/<lang>/index.json` holds what that language's menu, home page and search need:

```jsonc
{
	"topics": [
		{
			"id": "gateways", // URL segment
			"icon": "gateway", // hardware | software | gateway | concepts
			"title": "Gateways",
			"description": "…",
			"pages": ["installing-a-gateway"] // slugs in this language, in menu order
		}
	],
	"pages": {
		"installing-a-gateway": {
			"topic": "gateways",
			"title": "Installing a gateway",
			"summary": "…",
			"image": null, // card picture, e.g. "images/gateway.jpg"
			"hasVideo": false,
			"keywords": ["antenna"]
		}
	},
	"featured": ["installing-a-gateway"], // "Start here" on the home page
	"popular": ["installing-a-gateway"] // quick links under the search box
}
```

`static/content/<lang>/pages/<slug>.json` holds one guide in one language:

```jsonc
{
	"slug": "installing-a-gateway",
	"topic": "gateways",
	"title": "…",
	"intro": "…",
	"sections": [
		{
			"id": "connect", // the #anchor. Lowercase words joined by hyphens.
			"heading": "…",
			"body": [
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
			],
			"image": {
				// optional
				"src": "images/ports.jpg", // relative to static/content/, or null until the photo exists
				"alt": "…",
				"caption": "…",
				"side": "right", // left | right on wide screens; always above the text on a phone
				"width": 1200,
				"height": 776
			}
		}
	],
	"links": [
		// optional, shown as "Related links"
		{ "kind": "page", "slug": "what-is-lorawan" },
		{ "kind": "url", "href": "https://www.cropwatch.io", "label": "CropWatch website" }
	],
	"video": { "url": "https://www.youtube.com/watch?v=VIDEO_ID" } // optional, shown last
}
```

Rules the site relies on:

- A page belongs to the language whose folder it is in, and only that one. A slug may exist in both folders, in one, or in neither; the site 404s an address the current language has no file for, and the language menu sends the reader to that language's home page instead of a dead link.
- A topic with no pages in a language is hidden from that language's menu and home page, and its address 404s there. It comes back by itself when a page is written for it, so a topic can stay in both `index.json` files with its name already translated.
- A text run's `href` is either a web address or `page:<slug>` / `page:<slug>#<section-id>`. A link may only point at a page in the same language folder; `content.spec.ts` fails the build otherwise.
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

- **English / 日本語** at the top chooses which language you are working in. Everything below it belongs to that language alone: its pages, its topics, its menu order.
- **Pages** lists that language's pages and whether each differs from the website. Underneath, guides written in the other language but not this one can be started with one button, which copies the sections, anchors and pictures across and leaves the words to write.
- **Edit a page** is a form: title, introduction, then sections with a heading, a picture and text. The text has bold, italic, lists, callouts and links; a link to another guide is chosen from a list, so it can never point at a page that does not exist.
- **Pictures** are resized to 1600px, saved as WebP in `static/content/images/<page>/`, and the first one becomes the page's card picture. Pictures that are replaced or removed are deleted from the project when the page is saved.
- **Section links** (`#connect`) are made from the heading for a new section, and never change afterwards, so links people already have keep working. A translation started from the other language inherits its anchors, which is what keeps one shared link working in both. The same holds for a page's address once it has a picture or has been saved.
- **Save page** writes `static/content/<lang>/pages/<slug>.json` and updates that language's `index.json`. It never touches the other language's files. It refuses to save until anything missing is filled in, and says what it is.
- **Deleting** removes this language's copy. The other language keeps its own, and the pictures survive as long as either language still uses them.
- **Publish to website** commits `static/content` and pushes it, which makes Vercel rebuild. The button says how many files differ; it is disabled until the project is in git with a remote.

### Editing the files by hand instead

1. Create `static/content/<lang>/pages/<slug>.json`.
2. Add the slug to a topic's `pages` list and to `pages` in `static/content/<lang>/index.json`.
3. Put pictures in `static/content/images/<slug>/`. Both languages can point at the same file.
4. Run `pnpm test:unit`, then commit and push. Vercel rebuilds the site.

## Adding a language

Add the code to `LOCALES` and `LOCALE_INFO` in `src/lib/models/locale.ts`, then add a block to `src/lib/models/messages.ts`. TypeScript reports every label that is still missing. Then create `static/content/<code>/index.json` with the topics translated and empty `pages`, `featured` and `popular`; the editor and the site pick it up from there, and the new language starts with no guides rather than with English ones.

## Who can reach the site

The site is restricted to visitors in the **United States and Japan**. Everyone else gets a 403.

This is a Vercel Firewall rule, not code, so it is not in this repository:

```sh
vercel firewall rules list --scope crop-watch-team          # "Allow United States and Japan only"
vercel firewall rules inspect "Allow United States and Japan only" --scope crop-watch-team
```

It matches `geo country is not any of US, JP` and denies. It covers every address of the project — `kb.cropwatch.io`, the `.vercel.app` URLs and preview deployments — and every file, pages and pictures alike. Vercel is not billed for blocked requests.

Worth knowing:

- The country comes from the visitor's IP address, so a VPN decides the answer. Someone in Tokyo on a European exit node is blocked; someone in Berlin on a US exit node is not.
- Googlebot and Bingbot crawl from the United States, so indexing still works.
- To change the countries, edit the rule's condition and publish; to lift the restriction, `vercel firewall rules disable "Allow United States and Japan only"` and publish. Changes are staged until `vercel firewall publish`.

## Deployment

Pushing to `main` deploys. Vercel builds the project, prerenders every page and publishes it; a build takes about 20 seconds. Pull requests get their own preview URL.

The project uses `@sveltejs/adapter-vercel`. All pages are static files; `/` is one small serverless function for the language redirect. `vite.config.ts` reads `VERCEL_PROJECT_PRODUCTION_URL` during the build and passes it as `paths.origin`, so the `hreflang` links carry the production domain.

To point a real address at the site (`help.cropwatch.io`, say), add the domain to the `cw-knowledge-base` project in Vercel and add the DNS record it asks for.

Outbound links (app, support) are in `src/lib/models/site.ts` and still point at `www.cropwatch.io`.
