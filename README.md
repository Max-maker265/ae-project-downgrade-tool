# AE Project Downgrade Tool

AE Project Downgrade Tool is a desktop utility for converting Adobe After Effects project files to lower target versions.

The GitHub version is free to use and does not require an activation code.

## Features

- Convert AE project files for compatibility with lower AE versions
- Local desktop workflow
- Electron-based interface
- No account, activation code, or network service required

## Source

The Electron source code is in:

```text
src/electron
```

## Development

```bash
cd src/electron
npm install
npm start
```

## Build

```bash
cd src/electron
npm run build
```

## Release Assets

Large binary files are not committed to the repository. Upload installers through GitHub Releases instead:

- Windows app: `release-assets/windows/AE工程降级工具.exe`
- macOS app: `release-assets/AE工程降级工具-1.0.0-arm64.dmg`

## Notes

This repository should not include `node_modules`, generated `dist` folders, or large installer binaries in normal commits.

Please back up the original AE project before conversion. Some effects, expressions, or features from newer AE versions may not be fully compatible with older target versions.
