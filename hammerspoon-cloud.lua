-- Keystroke Mirror - Hammerspoon Configuration (Cloud Version)
-- This script captures all keystrokes and sends them to the cloud server

-- CHANGE THIS to your deployed app URL after deployment
local SERVER_URL = "https://YOUR-APP-URL-HERE.railway.app/keystroke"
local TOGGLE_HOTKEY = {}
local TOGGLE_KEY = "escape"

local capturing = false
local eventtap = nil

local function sendKeystroke(key, char, shift)
  local json = hs.json.encode({key = key, char = char, shift = shift})
  
  hs.http.asyncPost(SERVER_URL, json, {
    ["Content-Type"] = "application/json"
  }, function(status, body, headers)
    if status ~= 200 then
      print("Failed to send keystroke: " .. tostring(status))
    end
  end)
end

local function startCapture()
  if eventtap then
    eventtap:start()
    capturing = true
    print("Keystroke capture started")
  end
end

local function stopCapture()
  if eventtap then
    eventtap:stop()
    capturing = false
    print("Keystroke capture stopped")
  end
end

local function toggleCapture()
  if capturing then
    stopCapture()
  else
    startCapture()
  end
end

eventtap = hs.eventtap.new({hs.eventtap.event.types.keyDown}, function(event)
  local keyCode = event:getKeyCode()
  local flags = event:getFlags()
  local chars = event:getCharacters()
  
  local keyName = hs.keycodes.map[keyCode]
  
  -- Check if shift key is pressed
  local shiftPressed = flags.shift or false
  
  if keyName == "escape" then
    return false
  end
  
  if keyName == "delete" or keyName == "forwarddelete" then
    sendKeystroke("delete", nil, shiftPressed)
  elseif keyName == "return" then
    sendKeystroke("return", nil, shiftPressed)
  elseif keyName == "tab" then
    sendKeystroke("tab", nil, shiftPressed)
  elseif keyName == "space" then
    sendKeystroke("space", nil, shiftPressed)
  elseif keyName == "up" then
    sendKeystroke("up", "↑", shiftPressed)
  elseif keyName == "down" then
    sendKeystroke("down", "↓", shiftPressed)
  elseif keyName == "left" then
    sendKeystroke("left", "←", shiftPressed)
  elseif keyName == "right" then
    sendKeystroke("right", "→", shiftPressed)
  elseif chars and #chars > 0 then
    sendKeystroke(keyName, chars, shiftPressed)
  end
  
  return false
end)

hs.hotkey.bind(TOGGLE_HOTKEY, TOGGLE_KEY, toggleCapture)

hs.alert.show("Keystroke Mirror (Cloud) loaded\nPress ESC to toggle", 3)
print([[
╔════════════════════════════════════════════════════════════╗
║  Keystroke Mirror (Cloud) - Hammerspoon Script Loaded     ║
╠════════════════════════════════════════════════════════════╣
║  Toggle: ESC                                               ║
║  Status: INACTIVE (press hotkey to start)                  ║
║                                                            ║
║  Sending to cloud server!                                  ║
╚════════════════════════════════════════════════════════════╝
]])
