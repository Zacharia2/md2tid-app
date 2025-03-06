# MD2TID

Any Markdown To TiddlyWiki

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## buid

https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.4.2/nsis_tauri_utils.dll

https://github.com/wixtoolset/wix3/releases/download/wix3141rtm/wix314-binaries.zip

https://github.com/tauri-apps/binary-releases/releases/download/nsis-3/nsis-3.zip

So for tauri v2.0, if you have some network problems when install wixtools and nsistools during the building process. You can do the following steps offline.

- Download wix314-binaries.zip and extract to `%localappdata%\tauri\WixTools314`.
- Download nsis-3.zip and extract to `%localappdata%\tauri\NSIS`.
- Download nsis_tauri_utils.dll and put it into `%localappdata%\tauri\NSIS\Plugins\x86-unicode\nsis_tauri_utils.dll`.

Then it's all down.
