const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentText = '';
let cursorPosition = 0;
let selectionStart = null; // null when no selection
let selectionEnd = null;

// Enable CORS for cloud deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static('public'));

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ 
    type: 'init', 
    text: currentText, 
    cursorPosition,
    selectionStart,
    selectionEnd
  }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.post('/keystroke', express.json(), (req, res) => {
  const { key, char, shift } = req.body;
  
  // Helper to clear selection
  const clearSelection = () => {
    selectionStart = null;
    selectionEnd = null;
  };
  
  // Helper to delete selected text
  const deleteSelection = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      currentText = currentText.slice(0, start) + currentText.slice(end);
      cursorPosition = start;
      clearSelection();
      return true;
    }
    return false;
  };
  
  if (key === 'delete' || key === 'backspace') {
    // If there's a selection, delete it
    if (!deleteSelection()) {
      // Otherwise delete single character
      if (cursorPosition > 0) {
        currentText = currentText.slice(0, cursorPosition - 1) + currentText.slice(cursorPosition);
        cursorPosition--;
      }
    }
  } else if (key === 'forwarddelete') {
    if (!deleteSelection()) {
      if (cursorPosition < currentText.length) {
        currentText = currentText.slice(0, cursorPosition) + currentText.slice(cursorPosition + 1);
      }
    }
  } else if (key === 'return' || key === 'enter') {
    deleteSelection();
    currentText = currentText.slice(0, cursorPosition) + '\n' + currentText.slice(cursorPosition);
    cursorPosition++;
  } else if (key === 'tab') {
    deleteSelection();
    currentText = currentText.slice(0, cursorPosition) + '\t' + currentText.slice(cursorPosition);
    cursorPosition++;
  } else if (key === 'space') {
    deleteSelection();
    currentText = currentText.slice(0, cursorPosition) + ' ' + currentText.slice(cursorPosition);
    cursorPosition++;
  } else if (key === 'up') {
    const beforeCursor = currentText.slice(0, cursorPosition);
    const lastNewline = beforeCursor.lastIndexOf('\n');
    let newPos = cursorPosition;
    
    if (lastNewline > 0) {
      const secondLastNewline = beforeCursor.slice(0, lastNewline).lastIndexOf('\n');
      const currentColumn = cursorPosition - lastNewline - 1;
      const targetLineStart = secondLastNewline + 1;
      const targetLineEnd = lastNewline;
      const targetLineLength = targetLineEnd - targetLineStart;
      newPos = targetLineStart + Math.min(currentColumn, targetLineLength);
    } else if (lastNewline === 0) {
      newPos = 0;
    }
    
    if (shift) {
      if (selectionStart === null) {
        selectionStart = cursorPosition;
      }
      cursorPosition = newPos;
      selectionEnd = cursorPosition;
    } else {
      clearSelection();
      cursorPosition = newPos;
    }
  } else if (key === 'down') {
    const afterCursor = currentText.slice(cursorPosition);
    const nextNewline = afterCursor.indexOf('\n');
    let newPos = cursorPosition;
    
    if (nextNewline !== -1) {
      const beforeCursor = currentText.slice(0, cursorPosition);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentColumn = cursorPosition - lastNewline - 1;
      const targetLineStart = cursorPosition + nextNewline + 1;
      const secondNewline = currentText.slice(targetLineStart).indexOf('\n');
      const targetLineEnd = secondNewline === -1 ? currentText.length : targetLineStart + secondNewline;
      const targetLineLength = targetLineEnd - targetLineStart;
      newPos = targetLineStart + Math.min(currentColumn, targetLineLength);
    } else {
      newPos = currentText.length;
    }
    
    if (shift) {
      if (selectionStart === null) {
        selectionStart = cursorPosition;
      }
      cursorPosition = newPos;
      selectionEnd = cursorPosition;
    } else {
      clearSelection();
      cursorPosition = newPos;
    }
  } else if (key === 'left') {
    if (shift) {
      if (selectionStart === null) {
        selectionStart = cursorPosition;
      }
      if (cursorPosition > 0) {
        cursorPosition--;
      }
      selectionEnd = cursorPosition;
    } else {
      clearSelection();
      if (cursorPosition > 0) {
        cursorPosition--;
      }
    }
  } else if (key === 'right') {
    if (shift) {
      if (selectionStart === null) {
        selectionStart = cursorPosition;
      }
      if (cursorPosition < currentText.length) {
        cursorPosition++;
      }
      selectionEnd = cursorPosition;
    } else {
      clearSelection();
      if (cursorPosition < currentText.length) {
        cursorPosition++;
      }
    }
  } else if (char) {
    // Typing replaces selection
    deleteSelection();
    currentText = currentText.slice(0, cursorPosition) + char + currentText.slice(cursorPosition);
    cursorPosition++;
  }
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        type: 'update', 
        text: currentText, 
        cursorPosition,
        selectionStart,
        selectionEnd
      }));
    }
  });
  
  res.sendStatus(200);
});

app.post('/clear', (req, res) => {
  currentText = '';
  cursorPosition = 0;
  selectionStart = null;
  selectionEnd = null;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'clear' }));
    }
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Keystroke Mirror Server running on port ${PORT}`);
});
