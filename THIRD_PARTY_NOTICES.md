# Third-party notices

## @breezystack/lamejs 1.2.7

MP3 encoding uses the unmodified `@breezystack/lamejs` JavaScript port of LAME by Alex Zhukov and contributors.

- Package and upstream notice: https://www.npmjs.com/package/@breezystack/lamejs/v/1.2.7
- Upstream source at the package's `gitHead`: https://github.com/shijinyu/lamejs/tree/1fb0ef5fa177413107e2e107d054a9b994e3f79c
- Original project: https://github.com/zhuker/lamejs
- LAME: https://lame.sourceforge.io/
- License declared by the package: GNU Lesser General Public License v3.0. The package's own `LICENSE`, `LICENSES/LGPL-3.0.txt` and `LICENSES/GPL-3.0.txt` are distributed with this extension.

The corresponding source is included in `third_party/lamejs-1.2.7/source.tar.gz`, alongside build instructions and a build dependency lock file. The archive contains the upstream tracked source at the gitHead above, excluding only the upstream `testdata/` audio fixtures; those fixtures are not needed to build the encoder. The unmodified source preserves individual copyright and license notices, including notices for Mark Taylor, Takehiro Tominaga, Robert Hegemann, Gabriel Bouvigne, Naoki Shibata, Alexander Leidinger, David Robinson and Glen Sawyer. Consult the source files for their exact notices. Some files specify LGPL version 2 or later or 2.1 or later; their original terms remain applicable. LGPL 2.0, LGPL 2.1 and GPL 2.0 texts are also included in `LICENSES/`.

The extension does not modify the encoder. It is included as a separate package at `node_modules/@breezystack/lamejs`, loaded at runtime rather than bundled into the extension's source. To use a modified compatible encoder, replace its `dist/lamejs.js` in the installed extension directory and restart the extension host; preserve the package's ESM exports. This was tested with VS Code 1.143.1 on Linux; an extension update may overwrite the replacement. Modified versions and redistribution remain subject to their applicable license terms.
