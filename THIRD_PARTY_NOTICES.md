# Third-party notices

## @breezystack/lamejs 1.2.7

MP3 encoding uses the unmodified `@breezystack/lamejs` JavaScript port of LAME by Alex Zhukov and contributors.

- Package and upstream notice: https://www.npmjs.com/package/@breezystack/lamejs/v/1.2.7
- Upstream source at the package's `gitHead`: https://github.com/shijinyu/lamejs/tree/1fb0ef5fa177413107e2e107d054a9b994e3f79c
- Original project: https://github.com/zhuker/lamejs
- LAME: https://lame.sourceforge.io/
- License declared by the package: GNU Lesser General Public License v3.0. The package's own `LICENSE`, `LICENSES/LGPL-3.0.txt` and `LICENSES/GPL-3.0.txt` are distributed with this extension.

The extension does not modify the encoder. It is included as a separate package at `node_modules/@breezystack/lamejs`, loaded at runtime rather than bundled into the extension's source. A replacement must preserve the package's ESM exports. Replacement in an installed VSIX and the completeness of the upstream corresponding source still need verification before distribution. Modified versions and redistribution remain subject to their applicable license terms.
