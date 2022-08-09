// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }

    document.getElementById('arch').innerText = process.arch;
  })

ipcRenderer.on('renderer-spawn-process', async () => {
  const t = await require('./spawn-test').spawnExecTime();
  ipcRenderer.send('renderer-spawn-process-result', t);
})

ipcRenderer.on('renderer-calc-fibonacci', async () => {
  const t = await require('./fibonacci')();
  ipcRenderer.send('renderer-calc-fibonacci-result', t);
})

ipcRenderer.on('perf-results', (event, results) => {
  document.getElementById('perf-results').innerText = results.join('\n');
})