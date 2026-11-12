# @breezystack/lamejs 1.2.7 source

`source.tar.gz` contains the tracked source from upstream commit `1fb0ef5fa177413107e2e107d054a9b994e3f79c`, excluding the `testdata/` audio fixtures. All included files retain their upstream contents and notices. The archive includes source, `vite.config.ts`, package metadata, the upstream pnpm lock and scripts. The fixtures are not needed for the production build. Upstream: https://github.com/shijinyu/lamejs/tree/1fb0ef5fa177413107e2e107d054a9b994e3f79c

The adjacent npm `package-lock.json` was generated for this distribution to preserve the versions used to reproduce the shipped build; it is not an upstream file. With Node.js 20.18.1 and npm 10.8.2, extract the archive into a new writable directory, copy this lock file there as `package-lock.json`, then run:

```sh
npm ci --ignore-scripts
npm run build
```

These commands require network access to obtain the general-purpose build dependencies. SHA-256 of the expected build results:

- `dist/lamejs.js`: `1c5f944911ccf2f6e29ab36c2e568363210ab16f50c0d76077060f40ecf91d28`
- `dist/lamejs.iife.js`: `0be202ec162aa3042d5c5c4e6288ad326cff8cec7312c2894a0a91ad2f9aeda1`

To use a compatible modified build in an installed extension, replace `node_modules/@breezystack/lamejs/dist/lamejs.js` inside its installation directory and restart the extension host. Preserve the ESM exports; extension updates may overwrite the replacement. See `THIRD_PARTY_NOTICES.md` and `LICENSES/` in the extension for further notices and license texts.
