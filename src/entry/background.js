import Api from "../assets/js/api"
import Commands from "../assets/js/commands.js"
import {
  WINDOW_ID_NONE,
} from "../assets/js/common"
// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.browserAction.onClicked.addListener(tab => {
  console.log('browserAction', tab)
  // chrome.tabs.create({
  //   url: "chrome://extensions/shortcuts"
  // })
});

var windowsHistory = []

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
    chrome.runtime.sendMessage({
      activatedObj: info
    });
  })
})

var windowsOnCreatedTimeount
chrome.windows.onRemoved.addListener(windowId => {
  console.log('windows.onRemoved', windowId)
  clearTimeout(windowsOnCreatedTimeount)
})

chrome.windows.onCreated.addListener(window => {
  console.log('windows.onCreated', window)
  Api.isPreventClose(value => {
    if (value && window.type == 'normal') {
      windowsOnCreatedTimeount = setTimeout(() => {
        try {
          chrome.tabs.query({
            windowId: window.id
          }, tabs => {
            tabs.forEach(tab => {
              tab.url == Api.getPreventCloseTabUrl() && chrome.tabs.remove(tab.id)
            })
            chrome.tabs.create({
              windowId: window.id,
              url: Api.getPreventCloseTabUrl(),
              pinned: true
            }, _ => {
              clearTimeout(windowsOnCreatedTimeount)
            })
          })
        } catch (error) {
          console.error('windows.onCreated', error)
          clearTimeout(windowsOnCreatedTimeount)
        }
      }, 666)
    }
  })
})

chrome.runtime.onInstalled.addListener(function () {
  console.log('onInstalled')
  // chrome.storage.sync.set({
  //   color: '#3aa757'
  // }, function () {
  //   console.log("The color is green.");
  // });

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


chrome.bookmarks.onCreated.addListener((id, bookmarks) => {
  console.log('bookmarks', bookmarks)
  Api.isBookmarkTitleSimplifier(value => {
    if (value && bookmarks.id) {
      let newTitle = bookmarks.title.split('-')[0].trim()
      let timtout = setTimeout(() => {
        Api.renameBookmark(bookmarks.id, newTitle, () => {
          ({
            type: 'basic',
            iconUrl: 'images/lazy_chrome48.png?raw=true',
            'message': newTitle
          }).let(it => {
            it['title'] = "bookmarkRename".let(Api.getI18nMsg)
            Api.createNotifications('bookmarkRename', it)
          })
          clearTimeout(timtout);
        })
      }, 333)
    }
  })
})