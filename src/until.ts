import { path } from "@tauri-apps/api";
import { join } from "@tauri-apps/api/path";
import { readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs";
import { md2tid } from "md-to-tid";

export const testfile =
  "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/360 评估.md";
export const tidresult =
  "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/tidresult.md";

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

async function transform_and_write(sourcefile: string, savefile: string) {
  savefile = await path.join(savefile, await path.basename(sourcefile));
  // console.log(savefile);
  let md = await read(sourcefile);
  let tid = await md2tid(md);
  await write(savefile, tid);
}

export { remove, readDirs, transform_and_write };
