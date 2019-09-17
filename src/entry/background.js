import {
  Common
} from "../assets/js/common.js"
import Commands from "../assets/js/commands.js"
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
  console.log('onActivated', info)
  console.log('windowsHistory', windowsHistory);
  (windowsHistory.find(element => element.windowId == info.windowId) || false).let(it => {
    if (it) {
      it.lastId = it.tabId
      it.tabId = info.tabId
    } else {
      windowsHistory.push(info)
    }

    chrome.runtime.sendMessage({
      activatedObj: it || info
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
  Common.isPreventClose(value => {
    if (value && window.type == 'normal') {
      windowsOnCreatedTimeount = setTimeout(() => {
        try {
          chrome.tabs.query({
            windowId: window.id
          }, tabs => {
            tabs.forEach(tab => {
              tab.url == Common.getPreventCloseTabUrl() && chrome.tabs.remove(tab.id)
            })
            chrome.tabs.create({
              windowId: window.id,
              url: Common.getPreventCloseTabUrl(),
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