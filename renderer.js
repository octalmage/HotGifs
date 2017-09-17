const riot = require('riot');
const { remote, clipboard } = require('electron');

const win = remote.getCurrentWindow();
// Require our tags.
require('./assets/tags/main.tag');
require('./assets/tags/settings.tag');

riot.mount('main', {
  win,
  clipboard,
  settings: win.settings,
  visitor: win.visitor,
  config: win.config,
});
