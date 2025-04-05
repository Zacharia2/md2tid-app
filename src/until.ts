import { path } from "@tauri-apps/api";
import { join } from "@tauri-apps/api/path";
import { readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs";
import { md2tid } from "md-to-tid";

async function readMdInDirs(dir: string, customfilter: string[], fileFilter: string): Promise<string[]> {
  let ignoreDir = [".git", ".obsidian"];
  const entries = await readDir(dir);
  const Reg = RegExp(fileFilter);
  let processingQueue = entries.map((entry) => ({
    basePath: dir,
    entry: entry,
  }));
  let filePaths: string[] = [];
  if (customfilter) {
    for (const folder of customfilter) {
      ignoreDir.push(folder)
    }
  }
  // 语言表示的是相对位置，上下，左右，父子，当前和下层
  while (processingQueue.length > 0) {
    const queueItem = processingQueue.pop();
    if (!queueItem) continue;
    let basePath = queueItem["basePath"];
    let entries = queueItem["entry"];
    if (!entries.isDirectory) {
      let file = await join(basePath, entries.name);
      let basename = await path.basename(file);
      let suffix = basename.split(".").slice(-1)[0];
      // 非md文件或者非匹配文件跳过
      if (suffix != "md" || !Reg.test(await read(file))) continue;
      filePaths.push(file);
    } else if (!ignoreDir.includes(entries.name)) {
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

function makeNameSafe(name: string): string {
  return name.replace(/<|>|\:|\"|\/|\\|\||\?|\*|\^|\s/g, "_");
}
/**
 * @param apath 文件绝对路径
 * @param bpath 绝对根路径
 * @returns a - b 得到的相对路径
 */
function relpath(apath: string, bpath: string) {
  let a = seq(apath);
  let b = seq(bpath);
  return a.split(b)[1];
}

// function findDuplicatesInPath(filePaths: string[]) {
//   let fileset = filePaths.map((file) => {
//     return seq(file).split("/").slice(-1)[0];
//   });
//   console.log(fileset);
// }

async function write(path: string, data: string) {
  await writeFile(path, new TextEncoder().encode(data));
}

async function read(path: string) {
  return new TextDecoder("utf-8").decode(await readFile(path));
}

function seq(path: string) {
  return path.replace(/\\/g, "/");
}

function basepath(path: string) {
  return seq(path).slice(0, seq(path).lastIndexOf("/"));
}

async function transform(
  sourcePath: string,
  sourceFile: string,
  saveFolder: string
) {
  let basename = await path.basename(sourceFile);
  let tidTitle = basename.split(".")[0];
  let tidFileName = basename.split(".")[0] + ".tid";
  let MDFullPath = relpath(basepath(sourceFile), sourcePath);
  tidFileName = makeNameSafe("$" + (await path.join(MDFullPath, tidFileName)));
  let saveFile = await path.join(saveFolder, tidFileName);
  let tid = md2tid(await read(sourceFile));
  // TODO: 自定义条目名
  let tidFieldCaption = `caption: ${tidTitle}\n`;
  let tidFieldTitle = `title: ${tidTitle}\n`;
  let tidFiledMDFullPath = `MDFullPath: ${(MDFullPath = MDFullPath != "" ? MDFullPath : "/")}\n`;
  let tidFieldType = "type: text/vnd.tiddlywiki\n";
  tid = tidFieldCaption + tidFieldTitle + tidFiledMDFullPath + tidFieldType + "\n" + tid;
  await write(saveFile, tid);
}

export { remove, readMdInDirs, transform, relpath, seq };
