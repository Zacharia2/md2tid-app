import { path } from "@tauri-apps/api";
import { join } from "@tauri-apps/api/path";
import { readDir, readFile, remove, writeFile } from "@tauri-apps/plugin-fs";
import { md2tid } from "md-to-tid";

export const testfile =
  "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/360 评估.md";
export const tidresult =
  "C:/Users/Snowy/Documents/GitHub/md2tid/public/doc/tidresult.md";

async function readMdInDirs(dir: string): Promise<string[]> {
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
      let file = await join(basePath, entries.name);
      let basename = await path.basename(file);
      let suffix = basename.split(".").slice(-1)[0];
      if (suffix != "md") continue;
      filePaths.push(file);
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
  sourcefile: string,
  savefolder: string
) {
  let basename = await path.basename(sourcefile);
  let title = basename.split(".")[0];
  let tidname = basename.split(".")[0] + ".tid";
  let vpath = relpath(basepath(sourcefile), sourcePath);
  tidname = makeNameSafe("$" + (await path.join(vpath, tidname)));
  let savefile = await path.join(savefolder, tidname);
  let tid = await md2tid(await read(sourcefile));
  // TODO: 自定义条目名
  let field_caption = `caption: ${title}\n`;
  let field_title = `title: ${title}\n`;
  let filed_vpath = `vpath: ${vpath}\n`;
  let field_type = "type: text/vnd.tiddlywiki\n";
  tid = field_caption + field_title + filed_vpath + field_type + "\n" + tid;
  await write(savefile, tid);
}

export { remove, readMdInDirs, transform, relpath, seq };
