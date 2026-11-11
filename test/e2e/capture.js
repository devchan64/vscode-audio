const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function targets(port) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json`, response => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => { try { resolve(JSON.parse(data)); } catch (error) { reject(error); } });
    }).on('error', reject);
  });
}

async function capture(port, destination) {
  const pages = await targets(port);
  const page = pages.find(item => item.type === 'page' && item.url.startsWith('vscode-file:') && item.title.includes('audio-demo.wav'));
  if (!page) throw new Error('VS Code workbench debugging target not found');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Screenshot timed out')), 10000);
      socket.on('open', () => socket.send(JSON.stringify({ id: 1, method: 'Emulation.setDeviceMetricsOverride', params: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false } })));
      socket.on('message', data => {
        const message = JSON.parse(data);
        if (message.id === 1 && !message.error) {
          setTimeout(() => socket.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png', captureBeyondViewport: false } })), 500);
          return;
        }
        if (message.id !== 1 && message.id !== 2) return;
        clearTimeout(timer);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result.data);
      });
      socket.on('error', error => { clearTimeout(timer); reject(error); });
    });
    fs.mkdirSync(require('path').dirname(destination), { recursive: true });
    fs.writeFileSync(destination, Buffer.from(result, 'base64'));
  } finally {
    socket.close();
  }
}

module.exports = { capture };
