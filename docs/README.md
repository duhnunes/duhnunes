# docs.duhnunes.dev

The router for every tool's documentation. It holds no docs itself: each
`/<tool>/*` path is rewritten to that tool's own Vercel project, which builds
its RDX docs from its own repository.

| Path | Project |
| --- | --- |
| `/scs-intellisense` | `scs-intellisense.vercel.app` |

`/` sends visitors to the projects on duhnunes.dev. Unknown paths get `404.html`.

## Adding a tool

1. In the tool's `rdx.config.ts`, set `basePath: '/<tool>'` and
   `metadata.metadataBase: 'https://docs.duhnunes.dev'`. Deploy it.
2. Here, add a rewrite to `vercel.json`. Keep the prefix on both sides, so
   pages, assets and API calls reach the same project:

   ```json
   {
     "source": "/<tool>/:path*",
     "destination": "https://<tool-project>.vercel.app/<tool>/:path*"
   }
   ```

3. Add `https://docs.duhnunes.dev/<tool>/sitemap.xml` to `sitemap.xml`, and
   the tool to the table above.

List a tool only once it is released.

## Vercel

A separate Vercel project from the site: Root Directory `docs`, Framework
Preset "Other", no build command, domain `docs.duhnunes.dev`.
