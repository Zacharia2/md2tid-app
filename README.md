# MD2TID

Any Markdown To TiddlyWiki

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 开发与构建

### 配置开发环境（Windows）

对于 Windows10 来说，需要这些工具：`Microsoft C++ 生成工具`、`Rust`、`Node.js`、`VS Code`（插件：Tauri、rust-analyzer）。

另外本项目用 Pnpm + TS + React，这些不用安装，只需要把上面的工具安装好后，执行`pnpm i`即可

Tauri 使用 [Microsoft C++ 生成工具](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/)进行开发以及 Microsoft Edge WebView2。这两者都是在 Windows 上进行开发所必需的。

Rust 的安装需要先配置镜像，先配置 rustup，然后再配置 Cargo。

编辑系统环境变量配置 rustup，系统环境变量名为 RUSTUP_DIST_SERVER，值就是下面的值。保存后若打开了终端记得重开终端，重新载入变量到终端。

```yaml
RUSTUP_DIST_SERVER = https://mirrors.tuna.tsinghua.edu.cn/rustup
```

配置 Cargo。在你的用户名路径下新建文件`C:\Users\Name\.cargo\config.toml`，将下面内容复制粘贴进去。最后打开 Windows 终端 Powershell 执行命令进行安装`winget install --id Rustlang.Rustup`，这样就会丝滑的安装成功。

```toml
# C:\Users\Name\.cargo\config.toml
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

# 替换成你偏好的镜像源
replace-with = 'ustc'

# 清华大学
[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"

# 中国科学技术大学
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"

# 上海交通大学
[source.sjtu]
registry = "https://mirrors.sjtug.sjtu.edu.cn/git/crates.io-index"

# rustcc社区
[source.rustcc]
registry = "git://crates.rustcc.cn/crates.io-index"
```

### Pnpm tauri build

构建过程中会遇到网络下载的问题，可以使用下面的方法解决，主要下载三个文件，把这些文件放到对的位置，这样程序校验通过后就会正常进行编译过程。

- https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.4.2/nsis_tauri_utils.dll
- https://github.com/wixtoolset/wix3/releases/download/wix3141rtm/wix314-binaries.zip
- https://github.com/tauri-apps/binary-releases/releases/download/nsis-3/nsis-3.zip

So for tauri v2.0, if you have some network problems when install wixtools and nsistools during the building process. You can do the following steps offline.

- Download wix314-binaries.zip and extract to `%localappdata%\tauri\WixTools314`.
- Download nsis-3.zip and extract to `%localappdata%\tauri\NSIS`.
- Download nsis_tauri_utils.dll and put it into `%localappdata%\tauri\NSIS\Plugins\x86-unicode\nsis_tauri_utils.dll`.

Then it's all down.
