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
  Typography,
  useTheme,
} from "@mui/material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

function App() {
  // let dir = "C:/Users/Snowy/Documents/GitHub/md2tid/src";

  const [dirs, setDirs] = useState<string[]>([]);

  const [ensurepath, setEnsurePath] = useState("");
  const [targetPath, setTargetPath] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [tabvalue, setTabValue] = useState(1);
  const theme = useTheme();

  const [multilineIn, setMultilineIn] = useState("");
  const [multilineOut, setMultilineOut] = useState("");
  const multilineRef = useRef("");

  interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
  }

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

  function TabPanel(props: TabPanelProps) {
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
      <TabPanel value={tabvalue} index={0} dir={theme.direction}>
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
              md2tid(multilineRef.current).then((data) => {
                setMultilineOut(data);
              });
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
      <TabPanel value={tabvalue} index={1} dir={theme.direction}>
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
                setOpen(true);
                setMessage("无效路径");
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
                setOpen(true);
                setMessage("无可处理内容");
                return;
              } else if (targetPath == "") {
                setOpen(true);
                setMessage("目标路径为空");
                return;
              }
              setOpen(true);
              setMessage("正在处理");
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
      <TabPanel value={tabvalue} index={2} dir={theme.direction}>
        Item Three
      </TabPanel>
    </>
  );
}

export default App;
