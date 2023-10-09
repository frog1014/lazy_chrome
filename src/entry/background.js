import Api from "../assets/js/api"
import Commands from "../assets/js/commands"
import {
  COMMAND_MSG_TYPE,
  CREATE_PREVENT_CLOSE_TAB_MSG_TARGET,
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
      dispatchCommand(res.command)
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
  dispatchCommand(command);
});


function handlePreventCloseTab(res) {
  switch (res.target) {
    case CREATE_PREVENT_CLOSE_TAB_MSG_TARGET:
      Api.isPreventClosePageCreated().then(async isPreventClosePageCreated => {
        console.log(isPreventClosePageCreated)
        var targetUrl = Api.getPreventCloseTabUrl();
        !isPreventClosePageCreated && Api.getCurrentTab()
          .then(currentTab => Api.createTab({
            url: targetUrl,
            openerTabId: currentTab.id,
            pinned: true
          }));
      });
      break;

    default:
      break;
  }
}

function dispatchCommand(command) {
  switch (command) {
    case "toggle-pin": {
      Commands.togglePin();
      break;
    }

    case "toggle-mute": {
      Commands.toggleMute();
      break;
    }

    case "previousTabInSameWindow": {
      Commands.previousTabInSameWindow(windowsHistory);
      break;
    }

    case "previousTabLastWindow": {
      Commands.previousTabLastWindow(windowsHistory);
      break;
    }

    case "toShutUp": {
      Commands.toShutUp();
      break;
    }

    case "duplicate": {
      Commands.duplicate();
      break;
    }

    case "independent": {
      Commands.independent();
      break;
    }

    case "newTabWithUrl": {
      Commands.newTabWithUrl();
      break;
    }

    case "newQueryWithPasted": {
      Commands.newQueryWithPasted();
      break;
    }

    case "newQueryWithSelected": {
      Commands.newQueryWithSelected();
      break;
    }

    case "openNotepad": {
      Commands.openNotepad();
      break;
    }

    case "copyUrl": {
      Commands.copyUrl();
      break;
    }

    case "copyTitleAndUrl": {
      Commands.copyTitleAndUrl();
      break;
    }
    case "uniqueTabs": {
      Commands.uniqueTabs();
      break;
    }

    case "killSameDomain": {
      Commands.killSameDomain();
      break;
    }

    case "killOtherSameDomain": {
      Commands.killOtherSameDomain();
      break;
    }
    case "keepSameDomain": {
      Commands.keepSameDomain();
      break;
    }
  }
}
