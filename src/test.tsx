import { md2tid } from "md-to-tid";

import { exists, readFile } from "@tauri-apps/plugin-fs";

export async function test() {
  // 检查 `$APPDATA/avatar.png` 文件是否存在
  // 不允许绝对路径或父目录组件
  // 访问任意的文件系统路径，你必须在核心层上编写这样的逻辑。
  const testfile =
    "C:/Users/Snowy/Documents/GitHub/md2tid/src/assets/360 评估.md";
  let a: boolean = await exists(testfile);
  let b = await readFile(testfile);
  console.log(a);
  const tidText = await md2tid(new TextDecoder("utf-8").decode(b));
  console.log(tidText);
}
