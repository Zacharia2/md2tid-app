import { useState } from "react";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { DeleteOutline } from "@mui/icons-material";
import { readMdInDirs, transform } from "./until";

import {
  Button,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

function App() {
  // let dir = "C:/Users/Snowy/Documents/GitHub/md2tid/src";

  const [dirs, setDirs] = useState<string[]>([]);
  const [sourcePath, setSourcePath] = useState("");
  const [targetPath, setTargetPath] = useState("");

  // remove(testwfile);
  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    let value = dirs[index];
    let a = sourcePath.replace(/\\/g, "/");
    let b = value.replace(/\\/g, "/");
    let rel_path = b.split(a)[1];
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
        <ListItemText primary={`VaultFile: ${rel_path}`} />
      </ListItem>
    );
  }
  return (
    <main className="container">
      <TextField
        id="outlined-basic"
        label="输入"
        variant="outlined"
        size="small"
        style={{ marginBottom: 10 }}
        value={sourcePath}
        onChange={(e) => {
          setSourcePath(e.target.value);
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
        onClick={async () => {
          let dirs = await readMdInDirs(sourcePath);
          setDirs(dirs);
        }}
      >
        读取
      </Button>
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
      <Button
        variant="outlined"
        onClick={() => {
          for (let index = 0; index < dirs.length; index++) {
            const element = dirs[index];
            transform(element, targetPath);
          }
        }}
      >
        转换
      </Button>
    </main>
  );
}

export default App;
