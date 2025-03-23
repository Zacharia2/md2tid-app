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
  const [targetPath, setTargetPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dirs, setDirs] = useState<string[]>([]);

  // 变量、引用、状态
  // remove(testwfile);
  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    let value = dirs[index];
    let rel_path = relpath(value, ensurepath);
    return (
      <ListItem
        style={style}
        component="div"
        key={value}
        disableGutters
        secondaryAction={
          <ListItemButton
            aria-label="deleteItem"
            onClick={() =>
              setDirs((currentDirs) =>
                currentDirs.filter((dir) => dir !== value)
              )
            }
          >
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
