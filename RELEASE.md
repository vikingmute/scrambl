# Release Guide

This guide is the repeatable release flow for Scrambl packages and the docs site.

## What Gets Released

- npm packages:
  - `@scrambl/core`
  - `@scrambl/react`
  - `@scrambl/vue`
- Documentation site:
  - `https://scrambl.vikingz.me`
  - Cloudflare Pages project output: `docs/dist`

The package versions are linked through Changesets, so the three npm packages should move together.

## One-Time Setup

These should already be done:

- npm user: `vikingmute`
- npm org/scope: `scrambl`
- npm packages are public
- GitHub repo: `https://github.com/vikingmute/scrambl`
- Cloudflare Pages domain: `scrambl.vikingz.me`

Useful checks:

```bash
npm whoami
npm org ls scrambl
npm access list packages @scrambl --json
```

## Before Publishing

Start from a clean `main` branch:

```bash
git status --short --branch
git pull --ff-only
pnpm install --frozen-lockfile
```

Run local verification:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Check what npm will publish:

```bash
npm --cache /private/tmp/scrambl-npm-cache pack --dry-run --workspace @scrambl/core
npm --cache /private/tmp/scrambl-npm-cache pack --dry-run --workspace @scrambl/react
npm --cache /private/tmp/scrambl-npm-cache pack --dry-run --workspace @scrambl/vue
```

The tarballs should contain only:

- `README.md`
- `package.json`
- `dist/*`

## Versioning

Create a changeset:

```bash
pnpm changeset
```

Pick the packages that changed. Because the packages are linked in `.changeset/config.json`, the release should keep `@scrambl/core`, `@scrambl/react`, and `@scrambl/vue` aligned.

Apply the version bump:

```bash
pnpm version-packages
```

Review the changed files:

```bash
git diff --stat
git diff
```

Commit the version changes:

```bash
git add .
git commit -m "Release vX.Y.Z"
```

## Publish to npm

Publish:

```bash
pnpm release
```

This runs:

```bash
turbo build && changeset publish
```

If npm asks for an OTP, enter the current code from the npm account's 2FA app.

## Verify npm

Replace `X.Y.Z` with the published version:

```bash
npm view @scrambl/core@X.Y.Z version --json
npm view @scrambl/react@X.Y.Z version --json
npm view @scrambl/vue@X.Y.Z version --json
```

Then test install from a clean temp project:

```bash
tmpdir=$(mktemp -d /private/tmp/scrambl-smoke.XXXXXX)
cd "$tmpdir"
npm init -y
npm install @scrambl/core@X.Y.Z @scrambl/react@X.Y.Z @scrambl/vue@X.Y.Z
node --input-type=module -e "import { scramble } from '@scrambl/core'; import { useScramble as useReactScramble } from '@scrambl/react'; import { useScramble as useVueScramble } from '@scrambl/vue'; console.log(typeof scramble, typeof useReactScramble, typeof useVueScramble)"
```

Expected output:

```txt
function function function
```

## Push GitHub

Push commits and tags:

```bash
git push origin main
git push origin --tags
```

Changesets creates package tags such as:

```txt
@scrambl/core@X.Y.Z
@scrambl/react@X.Y.Z
@scrambl/vue@X.Y.Z
```

## Deploy Docs

Cloudflare Pages Git deployment should use:

```txt
Root directory: /
Build command: pnpm --filter @scrambl/core build && pnpm --filter @scrambl/docs build
Build output directory: docs/dist
Production branch: main
Node version: 20 or 22
```

The explicit core build is required because `@scrambl/docs` imports the workspace `@scrambl/core`, whose package entry points resolve to `packages/core/dist`.

For manual deployment:

```bash
pnpm --filter @scrambl/core build
pnpm --filter @scrambl/docs build
npx wrangler pages deploy docs/dist --project-name scrambl
```

Do not commit local Cloudflare deployment state such as `.wrangler/`.

## Verify Docs

After deployment:

```bash
curl -I https://scrambl.vikingz.me
curl -I https://scrambl.vikingz.me/logo-mark.webp
curl -I https://scrambl.vikingz.me/sitemap-index.xml
```

Open these pages:

- `https://scrambl.vikingz.me`
- `https://scrambl.vikingz.me/guides/installation/`
- `https://scrambl.vikingz.me/examples/demo-lab/`

Also check npm README rendering:

- `https://www.npmjs.com/package/@scrambl/core`
- `https://www.npmjs.com/package/@scrambl/react`
- `https://www.npmjs.com/package/@scrambl/vue`

## Common Issues

### Cloudflare cannot resolve `@scrambl/core`

Error:

```txt
Failed to resolve entry for package "@scrambl/core"
```

Fix the Cloudflare Pages build command:

```bash
pnpm --filter @scrambl/core build && pnpm --filter @scrambl/docs build
```

### `npm view @scrambl/core` returns 404 immediately after publishing

Check the explicit version first:

```bash
npm view @scrambl/core@X.Y.Z version --json
```

If explicit version works, the package is published and the generic/latest lookup may just be lagging.

### npm cache permission errors

If npm reports root-owned files in the local cache:

```bash
sudo chown -R 501:20 "/Users/viking/.npm"
```

