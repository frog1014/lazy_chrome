// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    url: "chrome://extensions/shortcuts"
  })
});

var curTabID = 0;
var windowsTemp = []

chrome.tabs.onActivated.addListener(info => {
  console.log('onActivated', info)
  var isFind = false
  var target = {}
  windowsTemp.forEach(element => {
    if (element.windowId == info.windowId) {
      element.lastId = element.tabId
      element.tabId = info.tabId
      isFind = true
      target = element
    }
  })

  if (!isFind) {
    windowsTemp.push(info)
    target = info
  }

  chrome.runtime.sendMessage({
    activatedObj: target
  });
})

var windowsOnCreatedTimeount
chrome.windows.onRemoved.addListener(windowId => {
  console.log('windows.onRemoved', windowId)
  clearTimeout(windowsOnCreatedTimeount)
})
chrome.windows.onCreated.addListener(window => {
  console.log('windows.onCreated', window)
  getStorageData(isPreventCloseTabTag, value => {
    if (value && window.type == 'normal') {
      windowsOnCreatedTimeount = setTimeout(() => {
        try {
          chrome.windows.get(window.id, window => {
            getTabs(tabs => {
              var isFind = tabs.find(tab => {
                return tab.url == getPreventCloseTabUrl()
              })
              chrome.tabs.create({
                url: getPreventCloseTabUrl(),
                pinned: true
              }, (obj) => {
                isFind && chrome.tabs.remove(isFind.id)
                getTabs(tabs => {
                  console.log(tabs)
                  chrome.tabs.update(tabs[0].id, {
                    'active': true
                  })
                })
                clearTimeout(windowsOnCreatedTimeount)
              })
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
  chrome.storage.sync.set({
    color: '#3aa757'
  }, function () {
    console.log("The color is green.");
  });

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



chrome.commands.onCommand.addListener(function (command) {
  console.log(command)
  switch (command) {
    case "toggle-pin": {
      getCurrentTab(function (tabs) {
        // Toggle the pinned status
        var current = tabs[0]
        chrome.tabs.update(current.id, {
          'pinned': !current.pinned
        });
      });
      break
    }

    case "toggle-mute": {
      getCurrentTab(function (tabs) {
        // Toggle the muted status
        var current = tabs[0]
        console.log(current)
        chrome.tabs.update(current.id, {
          'muted': !current.mutedInfo.muted
        });
      });
      break
    }

    case "toShutUp": {
      chrome.tabs.query({
        currentWindow: true,
        audible: true
      }, function (tabs) {
        console.log(tabs)
        getCurrentTab(current => {
          tabs.forEach(element => {
            chrome.tabs.update(element.id, {
              'muted': element.id == current[0].id ? current[0].mutedInfo.muted : true
            });
          })
        })
      });
      break
    }

    case "duplicate": {
      getCurrentTab(function (tabs) {
        var current = tabs[0]
        chrome.tabs.duplicate(current.id);
      });
      break
    }

    case "independent": {
      getCurrentTab(function (tabs) {
        var current = tabs[0]
        chrome.windows.create({
          focused: true
        }, function (newWin) {
          chrome.tabs.move(current.id, {
            windowId: newWin.id,
            index: -1
          }, function () {
            getCurrentTab(function (tabs) {
              chrome.tabs.remove(tabs[0].id);
            })
          });
        })
      });
      break
    }

    case "newTabWithUrl": {
      var clipboardContents = getPasted()
      var isUrl = clipboardContents.indexOf("://") > -1
      chrome.tabs.create({
        url: (isUrl ? clipboardContents : "https://www.google.com/search?q=" + (clipboardContents || "")) || "https://www.google.com/"
      })
      break
    }

    case "newQueryWithPasted": {
      var clipboardContents = getPasted()
      chrome.tabs.create({
        url: "https://www.google.com/search?q=" + (clipboardContents || "")
      })
      break
    }

    case "newQueryWithSelected": {
      chrome.tabs.executeScript({
        code: "window.getSelection().toString();"
      }, function (selection) {
        var clipboardContents = selection[0]
        chrome.tabs.create({
          url: "https://www.google.com/search?q=" + (clipboardContents || "")
        })
      });

      break
    }

    case "openNotepad": {
      chrome.tabs.create({
        url: "data:text/html, <html contenteditable>"
      })
      break
    }
  }
});