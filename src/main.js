const { app, BrowserWindow } = require("electron");
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    height: 500,
    width: 800,
    webPreferences: {
      preload: path.join(__dirname, "../logics.js"),
    },
  });

  win.maximize();
  win.loadFile(path.join(__dirname, "index.html"));
};


// app.whenReady().then(() => {
//   createWindow();
// });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
