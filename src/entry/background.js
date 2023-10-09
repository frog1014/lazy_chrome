import Api from "../assets/js/api"
import CommandsDispatcher from "../assets/js/commands"
import PreventCloasTabHandler from "../assets/js/prevent_close_tab"
import {
  COMMAND_MSG_TYPE,
  PREVENT_CLOSE_TAB_MSG_TYPE,
} from "../assets/js/const"
import {
  WINDOW_ID_NONE,
} from "../assets/js/const_api"

'use strict';

let windowsHistory = []
let windowId = WINDOW_ID_NONE

Api.runtimeOnMessageAddListener(async (res) => {
  console.log('backgroundJs', res)
  switch (res.type) {
    case COMMAND_MSG_TYPE:
      dispatchCommand(res.command, windowsHistory)
      break;
    case PREVENT_CLOSE_TAB_MSG_TYPE:
      handlePreventCloseTab(res);
      break;

    default:
      break;
  }
})

chrome.tabs.onActivated.addListener(info => {
  (windowsHistory.find(e => e.windowId == info.windowId) || false).let(found => {
    if (found) {
      info.lastId = found.tabId
      found.windowId = WINDOW_ID_NONE
    }
    windowsHistory.push(info)
    windowsHistory = windowsHistory.filter(e => e.windowId > WINDOW_ID_NONE);
  })
})

chrome.windows.onRemoved.addListener(windowId => {
  console.log('windows.onRemoved', windowId)
})

chrome.windows.onCreated.addListener(async window => {
  console.log('windows.onCreated', window)
  windowId = window.id || WINDOW_ID_NONE
  if (window.type == 'normal' && await Api.isPreventClose()) {

    console.log('windows.onCreated id', windowId)
    try {
      let tabs = await Api.queryTabs({
        windowId: windowId
      })
      let preventCloseTabUrl = Api.getPreventCloseTabUrl()
      tabs.forEach(tab => {
        tab.url == preventCloseTabUrl && Api.removeTabs(tab.id)
      })
      await Api.createTab({
        windowId: windowId,
        url: preventCloseTabUrl,
        pinned: true,
      })
    } catch (error) {
      console.error('windows.onCreated', error)
    }
  }
})

chrome.runtime.onInstalled.addListener(function () {
  console.log('onInstalled')
});

chrome.commands.onCommand.addListener(command => {
  console.log('onCommand', command)
  dispatchCommand(command, windowsHistory);
});


function handlePreventCloseTab(res) {
  PreventCloasTabHandler.dispatch(res, windowsHistory)
}

function dispatchCommand(command, windowsHistory) {
  CommandsDispatcher.dispatch(command, windowsHistory)
}
