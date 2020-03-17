// 1. Require the module
const TabGroup = require('electron-tabs');

// 2. Define the instance of the tab group (container)
let tabGroup = new TabGroup({
  // If you want a new button that appends a new tab, include:
  newTab: {
    title: `New Channel`,
    src: './index.html',
    visible: true,
    webviewAttributes: {
      nodeintegration: true
    }
  }
});

channelsCount = 0;

tabGroup.on('tab-added', (tab, tabGroup) => {
  tab.activate();
});

// 4. Add a new tab that contains a local HTML file
let tab1 = tabGroup.addTab({
  title: 'New Channel',
  src: './index.html',
  visible: true,
  // If the page needs to access Node.js modules, be sure to
  // enable the nodeintegration
  webviewAttributes: {
    nodeintegration: true
  }
});
