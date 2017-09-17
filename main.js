const {
  app, BrowserWindow, Menu, Tray, globalShortcut, MenuItem,
} = require('electron'); // eslint-disable-line import/no-extraneous-dependencies;
const path = require('path');
const url = require('url');
const fs = require('fs');
const ua = require('universal-analytics');
const AutoLaunch = require('auto-launch');
const Configstore = require('configstore');
const checkForUpdate = require('./assets/js/checkForUpdate');
const pkg = require('./package.json');

// Hide dock.
app.dock.hide();
const visitor = ua('UA-67011723-1');
const appVersion = pkg.version;
const runatstartup = new AutoLaunch({
  name: 'Hot Gifs',
  isHidden: 'false',
});

let config;
// Fallback to public API key if config not found.
if (fs.existsSync(path.join(__dirname, 'config.json'))) {
  config = require('./config.json'); // eslint-disable-line global-require import/no-unresolved
} else {
  config = { key: 'nbAalZ5usP7Ym4XbcbgbxH0LE0h4e5Eo' };
}

// Load user settings.
const settings = new Configstore(pkg.name, { 'opt-out': false, 'check-for-updates': true });

const settingsLabels = {
  'opt-out': 'Opt-out of anonymous usage logging.',
  'check-for-updates': 'Automatically check for updates.',
};

if (settings.get('check-for-updates')) {
  checkForUpdate(appVersion);
}

let appTray = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  appTray = new Tray(path.join(__dirname, 'assets/img/tray.png'));

  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({ label: 'Hot Gifs' }));
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({ label: `v${appVersion}` }));

  const startup = new MenuItem({
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

  contextMenu.append(new MenuItem({
    label: 'Settings',
    click: () => {
      const settingsWin = new BrowserWindow({
        width: 300,
        height: 100,
        toolbar: false,
      });
      settingsWin.settings = settings;
      settingsWin.settingsLabels = settingsLabels;
      settingsWin.loadURL(url.format({
        pathname: path.join(__dirname, 'assets/view/settings.html'),
        protocol: 'file:',
        slashes: true,
      }));
    },
  }));
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(new MenuItem({ label: 'Exit', click: () => app.exit() }));

  appTray.setContextMenu(contextMenu);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 60,
    frame: false,
    show: false,
    center: true,
    resizable: false,
    alwaysOnTop: true,
  });
  // Pass options to the window.
  mainWindow.settings = settings;
  mainWindow.visitor = visitor;
  mainWindow.config = config;

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  globalShortcut.register('Command+Alt+G', () => {
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
