import { md2tid } from "md-to-tid";

import { readFile, writeFile } from "@tauri-apps/plugin-fs";

export async function test() {
  // 检查 `$APPDATA/avatar.png` 文件是否存在
  // 不允许绝对路径或父目录组件
  // 访问任意的文件系统路径，你必须在核心层上编写这样的逻辑。
  const testfile =
    "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/360 评估.md";
  const testwfile =
    "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/tidresult.md";
  let b = await readFile(testfile);
  const tidText = await md2tid(new TextDecoder("utf-8").decode(b));
  let c = new TextEncoder().encode(tidText);
  console.log(tidText);
  
  writeFile(testwfile, c);
}
