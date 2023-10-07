import Api from "../assets/js/api"
import Commands from "../assets/js/commands"
import {
  ACTIVATED_OBJ_MSG_TYPE,
  ACTIVATED_OBJ_MSG_TARGET,
} from "../assets/js/common"
import {
  WINDOW_ID_NONE,
} from "../assets/js/common_api"

'use strict';

var windowsHistory = []
Api.runtimeOnMessageAddListener((res) => {
  console.log('backgroundJs', res)
})

chrome.tabs.onActivated.addListener(info => {
  console.log('onActivated', info);
  (windowsHistory.find(e => e.windowId == info.windowId) || false).let(it => {
    if (it) {
      info.lastId = it.tabId
      it.windowId = WINDOW_ID_NONE
    }
    windowsHistory.push(info)
    windowsHistory = windowsHistory.filter(e => e.windowId != WINDOW_ID_NONE);
    console.log('windowsHistory', windowsHistory);
    Api.chromeRuntimeSendMessage({
      activatedObj: info,
      type: ACTIVATED_OBJ_MSG_TYPE,
      target: ACTIVATED_OBJ_MSG_TARGET
    });
  })
})

const windowsOnCreatedAlarm = "windowsOnCreatedAlarm"
chrome.windows.onRemoved.addListener(windowId => {
  console.log('windows.onRemoved', windowId)
  clearAlarm();
})

chrome.windows.onCreated.addListener(window => {
  console.log('windows.onCreated', window)
  Api.isPreventClose(value => {
    if (value && window.type == 'normal') {
      Api.onAlarm(windowsOnCreatedAlarm, async () => {
        try {
          let tabs = await Api.queryTabs({
            windowId: window.id
          })
          tabs.forEach(tab => {
            tab.url == Api.getPreventCloseTabUrl() && Api.removeTabs(tab.id)
          })
          await Api.createTab({
            windowId: window.id,
            url: Api.getPreventCloseTabUrl(),
            pinned: true
          })
          clearAlarm();
        } catch (error) {
          console.error('windows.onCreated', error)
          clearAlarm();
        }
      })

      Api.startAlarm(windowsOnCreatedAlarm, 666)
    }
  })
})

chrome.runtime.onInstalled.addListener(function () {
  console.log('onInstalled')

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          hostEquals: 'developer.chrome.com'
        },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});


chrome.commands.onCommand.addListener(command => {
  console.log('onCommand', command)
  switch (command) {
    case "toggle-pin": {
      Commands.togglePin()
      break
    }

    case "toggle-mute": {
      Commands.toggleMute()
      break
    }

    case "previousTabInSameWindow": {
      Commands.previousTabInSameWindow(windowsHistory)
      break
    }

    case "previousTabLastWindow": {
      Commands.previousTabLastWindow(windowsHistory)
      break
    }

    case "toShutUp": {
      Commands.toShutUp()
      break
    }

    case "duplicate": {
      Commands.duplicate()
      break
    }

    case "independent": {
      Commands.independent()
      break
    }

    case "newTabWithUrl": {
      Commands.newTabWithUrl()
      break
    }

    case "newQueryWithPasted": {
      Commands.newQueryWithPasted()
      break
    }

    case "newQueryWithSelected": {
      Commands.newQueryWithSelected()
      break
    }

    case "openNotepad": {
      Commands.openNotepad()
      break
    }

    case "copyUrl": {
      Commands.copyUrl()
      break
    }

    case "copyTitleAndUrl": {
      Commands.copyTitleAndUrl()
      break
    }

    case "killSameDomain": {
      Commands.killSameDomain()
      break
    }

    case "killOtherSameDomain": {
      Commands.killOtherSameDomain()
      break
    }
    case "keepSameDomain": {
      Commands.keepSameDomain()
      break
    }
  }
});


chrome.bookmarks.onCreated.addListener(async (id, bookmarks) => {
  console.log('bookmarks', bookmarks)
  let value = await Api.isBookmarkTitleSimplifier()
  if (value && bookmarks.id && bookmarks.title.indexOf(' - ') > -1) {
    let newTitle = bookmarks.title.split(' - ').let(it => {
      it[it.length - 1] = false;
      return it.filter(e => e).join(' - ').trim()
    }) || bookmarks.title

    const alarm = "chrome.bookmarks.onCreated";

    Api.onAlarm(alarm, async () => {
      await Api.renameBookmark(bookmarks.id, newTitle);
      ({
        type: 'basic',
        iconUrl: 'images/lazy_chrome48.png?raw=true',
        'message': newTitle,
        title: "bookmarkRename".let(Api.getI18nMsg)
      }).let(it => Api.createNotifications('bookmarkRename', it))
      Api.clearAlarm(alarm)
    })

    Api.startAlarm(alarm, 333)
  }
})

function clearAlarm() {
  Api.clearAlarm(windowsOnCreatedAlarm);
}
