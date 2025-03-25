import { useState } from "react";
import "./App.css";
import { DeleteOutline } from "@mui/icons-material";
import { readMdInDirs, relpath, transform } from "./until";
import { md2tid } from "md-to-tid";
import { version } from "../src-tauri/tauri.conf.json";
import {
  Card,
  Elevation,
  Button,
  InputGroup,
  Tabs,
  Tab,
  TextArea,
} from "@blueprintjs/core";
import {
  CircularProgress,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

function App() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Card style={{ minHeight: 600 }} elevation={Elevation.TWO}>
      <Snackbar
        open={open}
        color=""
        autoHideDuration={1000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={(
          _event: React.SyntheticEvent | Event,
          reason?: SnackbarCloseReason
        ) => {
          if (reason === "clickaway") {
            return;
          }
          setOpen(false);
        }}
        message={message}
      />
      <Tabs>
        <Tab id="1" title="实时转换" panel={<实时转换 />} />{" "}
        <Tab
          id="2"
          title="批量转换"
          panel={<批量转换 setOpen={setOpen} setMessage={setMessage} />}
        />
        <Tab id="3" title="设置" panel={<设置 />} />
      </Tabs>
    </Card>
  );
}

const 实时转换 = () => {
  const [multilineIn, setMultilineIn] = useState("");
  const [multilineOut, setMultilineOut] = useState("");

  return (
    <Card className="container">
      <TextArea
        placeholder="MarkDown..."
        rows={10}
        value={multilineIn}
        onChange={(event) => {
          setMultilineIn(event.target.value);
          setMultilineOut(md2tid(event.target.value));
        }}
      />
      <br></br>
      <TextArea placeholder="TiddlyWiki..." rows={12} value={multilineOut} />
    </Card>
  );
};

const 批量转换 = (props: { setOpen: Function; setMessage: Function }) => {
  const [ensurepath, setEnsurePath] = useState("");
  const [absRootPath, setAbsRootPath] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dirs, setDirs] = useState<string[]>([]);

  // 组件状态，就是更新状态就会被动触发渲染。相当于函数变量。组件内主要使用它。
  // 副作用，就是在组件执行完return后执行的函数。类似异步
  // 函数变量只有在函数执行期间有效。
  // ref就是临时的组件变量。只是更改不触发渲染。
  // useMemo，记忆函数计算结果并返回数值
  // useCallback，记忆函数并返回函数
  // 组件和组件的函数定义是不一样的，组件就像实例，创建后就会一直到消失。
  // 函数定义就只有执行的一刻，然后消失，用于重新计算组件，组件比函数时间长。
  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    let value = dirs[index];
    // 关键在于确保列表内容在按钮点击时被固定下来，而不是持续依赖输入框的状态
    // 创建一个新状态保存执行后的结果，就可以和另一个状态分离，因为新状态是需要事件触发才会被更新。
    // - 状态分离 ：输入框的状态和列表的状态是分离的，列表数据只在按钮点击时更新，不受输入框后续修改的影响。
    // - 固定数据 ：按钮点击时，将输入框的当前值处理后存储在 listData 中，确保列表数据不会随着输入框的变化而变化。
    // 所以简而言之，就把结果存入状态就解决啦！
    let rel_path = relpath(value, absRootPath);
    function handleDeleteItem() {
      setDirs((currentDirs) => currentDirs.filter((dir) => dir !== value));
    }
    return (
      <ListItem
        style={style}
        component="div"
        key={value}
        disableGutters
        secondaryAction={
          <ListItemButton aria-label="deleteItem" onClick={handleDeleteItem}>
            <DeleteOutline />
          </ListItemButton>
        }
      >
        <ListItemText primary={`${rel_path}`} />
      </ListItem>
    );
  }

  const handleProgressFiles = () => {
    if (dirs.length == 0) {
      props.setOpen(true);
      props.setMessage("无可处理内容");
      return;
    } else if (targetPath == "") {
      props.setOpen(true);
      props.setMessage("目标路径为空");
      return;
    }
    props.setOpen(true);
    props.setMessage("正在处理");
    for (let index = 0; index < dirs.length; index++) {
      const element = dirs[index];
      transform(ensurepath, element, targetPath);
    }
  };

  const wait_progress = (
    <Card
      elevation={Elevation.ONE}
      style={{
        height: 350,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Card>
  );
  const file_list = (
    <Card elevation={Elevation.ONE}>
      <List
        height={350}
        width={"100%"}
        itemSize={30}
        itemCount={dirs.length}
        overscanCount={5}
        style={{ maxHeight: 400 }}
      >
        {renderRow}
      </List>
    </Card>
  );
  const handle_trans = () => {
    if (ensurepath == "") {
      props.setOpen(true);
      props.setMessage("无效路径");
      return;
    }
    setIsLoading(true);
    setAbsRootPath(ensurepath);
    readMdInDirs(ensurepath).then((dirs) => {
      setDirs(dirs);
      setIsLoading(false);
    });
  };
  return (
    <Card className="container">
      <InputGroup
        placeholder="输入文件夹"
        value={ensurepath}
        onChange={(e) => {
          setEnsurePath(e.target.value);
        }}
        rightElement={
          <Button variant="outlined" onClick={handle_trans}>
            读取文件列表
          </Button>
        }
      />
      <InputGroup
        placeholder="输出文件夹"
        value={targetPath}
        onChange={(e) => {
          setTargetPath(e.target.value);
        }}
        rightElement={
          <Button variant="outlined" onClick={handleProgressFiles}>
            开始转换文件
          </Button>
        }
      />
      {isLoading ? wait_progress : file_list}
    </Card>
  );
};

const 设置 = () => (
  <Card>
    当前版本：{version}
    <br></br>
    项目地址: <a>https://github.com/Zacharia2/md2tid</a>
  </Card>
);

export default App;
