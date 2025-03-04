import { md2tid } from "md-to-tid";

import { readFile, writeFile, readDir, remove } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

export async function test() {
  // 检查 `$APPDATA/avatar.png` 文件是否存在
  // 不允许绝对路径或父目录组件
  // 访问任意的文件系统路径，你必须在核心层上编写这样的逻辑。
  const testfile =
    "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/360 评估.md";
  const testwfile =
    "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/tidresult.md";
  // console.log(tidText);
  let dir = "C:/Users/Snowy/Documents/GitHub/md2tid/src";

  console.log(await readDirs(dir));

  const tidText = await md2tid(await read(testfile));
  remove(testwfile);
  write(testwfile, tidText);
}
async function readDirs(dir: string): Promise<string[]> {
  const entries = await readDir(dir);
  let processingQueue = entries.map((entry) => ({
    basePath: dir,
    entry: entry,
  }));
  let filePaths: string[] = [];
  // 语言表示的是相对位置，上下，左右，父子，当前和下层
  while (processingQueue.length > 0) {
    const queueItem = processingQueue.pop();
    if (!queueItem) continue;
    let basePath = queueItem["basePath"];
    let entries = queueItem["entry"];
    if (!entries.isDirectory) {
      filePaths.push(await join(basePath, entries.name));
    } else {
      const currentDirPath = await join(basePath, entries.name);
      const subEntries = await readDir(currentDirPath);
      let subEntryQueue = subEntries.map((entry) => ({
        basePath: currentDirPath,
        entry: entry,
      }));
      processingQueue.push(...subEntryQueue);
    }
  }
  return filePaths;
}

async function write(path: string, data: string) {
  await writeFile(path, new TextEncoder().encode(data));
}

async function read(path: string) {
  return new TextDecoder("utf-8").decode(await readFile(path));
}
