const electron = require('electron');
const {
  app, BrowserWindow, Menu, Tray, globalShortcut, MenuItem, Notification, shell,
} = electron;
app.dock.hide();
const pkg = require('./package.json');

const appVersion = pkg.version;

const path = require('path');
const url = require('url');

const ua = require('universal-analytics');

const visitor = ua('UA-67011723-1');

const AutoLaunch = require('auto-launch');

const runatstartup = new AutoLaunch({
  name: 'Hot Gifs',
  isHidden: 'false',
});

// TODO: Go back to config file.
const config = { key: '1234' };

// Load user settings.
const Configstore = require('configstore');

const settings = new Configstore(pkg.name, { 'opt-out': false, 'check-for-updates': true });

const fetch = require('node-fetch');
checkforupdate();

let appTray = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, startup;

function createWindow() {
  appTray = new Tray('./assets/img/tray.png');

   const contextMenu = new Menu();
   contextMenu.append(new MenuItem({ label: 'Hot Gifs' }));
   contextMenu.append(new MenuItem({ type: 'separator' }));
   contextMenu.append(new MenuItem({ label: `v${appVersion}` }));

   if (process.platform === 'darwin') {
     startup = new MenuItem({
        label: 'Run at startup?',
        type: 'checkbox',
        click: () => {
          if (startup.checked) {
            runatstartup.enable();
          } else {
            runatstartup.disable();
          }
        },
      });
     contextMenu.append(startup);

     runatstartup.isEnabled((found) => {
       if (found) {
         startup.checked = true;
       }
     });
   }

   contextMenu.append(new MenuItem({ type: 'separator' }));
   contextMenu.append(new MenuItem({ label: 'Exit', click: () => app.exit() }));

   appTray.setContextMenu(contextMenu);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500, height: 60, frame: false, show: false,
  });
  // Pass options to the window.
  mainWindow.settings = settings;
  mainWindow.visitor = visitor;

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  const ret = globalShortcut.register('Command+Alt+G', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

function checkforupdate() {
  fetch('https://api.github.com/repos/octalmage/hotgifs/releases')
    .then((response) => response.json())
    .then((releases) => {
      const current_version = releases[0].name.substr(1, releases[0].name.length);
      if (current_version !== appVersion) {
        const updateNotification = new Notification({
          title: 'Hot Gifs',
          body: `Update available! \nInstalled version: ${appVersion}.\nLatest version: ${current_version}.`,
        });
        updateNotification.on('click', () => {
          shell.openExternal('https://github.com/octalmage/HotGifs/releases/latest/');
        });
        updateNotification.show();
      }
    });
}
