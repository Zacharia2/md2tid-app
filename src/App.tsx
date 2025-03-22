import { useRef, useState } from "react";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { DeleteOutline } from "@mui/icons-material";
import { readMdInDirs, relpath, transform } from "./until";
import { md2tid } from "md-to-tid";

import {
  Box,
  Button,
  CircularProgress,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  SnackbarCloseReason,
  Tab,
  Tabs,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

function App() {
  // let dir = "C:/Users/Snowy/Documents/GitHub/md2tid/src";

  const [tabvalue, setTabValue] = useState(1);
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
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
      <Tabs
        value={tabvalue}
        onChange={(_event: React.SyntheticEvent, newValue: number) => {
          setTabValue(newValue);
        }}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab value={0} label="实时转换" />
        <Tab value={1} label="批量转换" />
        <Tab value={2} label="设置" />
      </Tabs>
      <动态转换 tabvalue={tabvalue} theme={theme}></动态转换>
      <批量转换
        tabvalue={tabvalue}
        theme={theme}
        setOpen={setOpen}
        setMessage={setMessage}
      ></批量转换>
      <设置 tabvalue={tabvalue} theme={theme}></设置>
    </>
  );
}

function TabPanel(props: {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
function 动态转换(props: { tabvalue: number; theme: Theme }) {
  const [multilineIn, setMultilineIn] = useState("");
  const [multilineOut, setMultilineOut] = useState("");
  const multilineRef = useRef("");

  return (
    <TabPanel value={props.tabvalue} index={0} dir={props.theme.direction}>
      <Box className="container">
        <TextField
          id="outlined-multiline-static"
          label="输入"
          multiline
          rows={8}
          autoFocus
          onFocus={(e) => {
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length
            );
          }}
          value={multilineIn}
          onChange={(event) => {
            multilineRef.current = event.target.value;
            setMultilineIn(event.target.value);
            setMultilineOut(md2tid(multilineRef.current));
          }}
        />
        <br></br>
        <TextField
          id="outlined-multiline-static"
          label="输出"
          multiline
          rows={8}
          value={multilineOut}
        />
      </Box>
    </TabPanel>
  );
}
function 批量转换(props: {
  tabvalue: number;
  theme: Theme;
  setOpen: Function;
  setMessage: Function;
}) {
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
        <ListItemText primary={`VFile: ${rel_path}`} />
      </ListItem>
    );
  }
  return (
    <TabPanel value={props.tabvalue} index={1} dir={props.theme.direction}>
      <Box className="container">
        <TextField
          id="outlined-basic"
          label="输入"
          variant="outlined"
          size="small"
          style={{ marginBottom: 10 }}
          value={ensurepath}
          onChange={(e) => {
            setEnsurePath(e.target.value);
          }}
        />
        <TextField
          id="outlined-basic"
          label="输出"
          variant="outlined"
          size="small"
          style={{ marginBottom: 10 }}
          value={targetPath}
          onChange={(e) => {
            setTargetPath(e.target.value);
          }}
        />
        <Button
          variant="outlined"
          style={{ marginBottom: 10 }}
          onClick={() => {
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
          }}
        >
          读取文件列表
        </Button>
        {isLoading ? (
          <Box
            sx={{
              height: 300,
              borderRadius: 1,
            }}
            display="flex"
            justifyContent="center" // 水平居中
            alignItems="center" // 垂直居中
          >
            <CircularProgress style={{}} />
          </Box>
        ) : (
          <List
            height={300}
            width={"100%"}
            itemSize={30}
            itemCount={dirs.length}
            overscanCount={5}
            style={{ maxHeight: 400 }}
          >
            {renderRow}
          </List>
        )}

        <Button
          variant="outlined"
          onClick={() => {
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
          }}
        >
          开始转换文件
        </Button>
      </Box>
    </TabPanel>
  );
}

function 设置(props: { tabvalue: number; theme: Theme }) {
  return (
    <TabPanel value={props.tabvalue} index={2} dir={props.theme.direction}>
      项目地址: <a>https://github.com/Zacharia2/md2tid</a>
    </TabPanel>
  );
}

export default App;
