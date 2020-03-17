// 1. Require the module
const TabGroup = require('electron-tabs');
const bilbao = 'hi';

// 2. Define the instance of the tab group (container)
let tabGroup = new TabGroup({
  // If you want a new button that appends a new tab, include:
  newTab: {
    title: `New Channel`,
    src: './channel.html',
    visible: true,
    active: true,
    webviewAttributes: {
      nodeintegration: true
    }
  }
});

// 4. Add a new tab that contains a local HTML file
let tab1 = tabGroup.addTab({
  title: 'New Channel',
  src: './channel.html',
  visible: true,
  active: true,
  // If the page needs to access Node.js modules, be sure to
  // enable the nodeintegration
  webviewAttributes: {
    nodeintegration: true,
    bilbil: 'hi'
  }
});

let tab = tabGroup.addTab({
  title: 'Electron',
  src: 'http://electron.atom.io',
  visible: true
});
