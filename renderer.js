const riot = require('riot');
const { remote, clipboard } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies

const win = remote.getCurrentWindow();
// Require our tags.
require('./assets/tags/main.tag');

riot.mount('main', {
  win,
  clipboard,
  settings: win.settings,
  visitor: win.visitor,
  config: win.config,
});
