// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    url: "chrome://extensions/shortcuts"
  })
});

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

function getPasted() {
  let bg = chrome.extension.getBackgroundPage(); // get the background page
  bg.document.body.innerHTML = ""; // clear the background page

  // add a DIV, contentEditable=true, to accept the paste action
  var helperdiv = bg.document.createElement("input");
  document.body.appendChild(helperdiv);
  helperdiv.focus();
  // trigger the paste action
  bg.document.execCommand("Paste");

  // read the clipboard contents from the helperdiv
  return helperdiv.value;
}

function getCurrentTab(callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, callback)
}
chrome.commands.onCommand.addListener(function (command) {
  console.log(command)
  switch (command) {
    case "toggle-pin": {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        // Toggle the pinned status
        var current = tabs[0]
        chrome.tabs.update(current.id, {
          'pinned': !current.pinned
        });
      });
      break
    }

    case "toggle-mute": {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
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
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        var current = tabs[0]
        chrome.tabs.duplicate(current.id);
      });
      break
    }

    case "independent": {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function (tabs) {
        var current = tabs[0]
        chrome.windows.create({
          focused: true
        }, function (newWin) {
          chrome.tabs.move(current.id, { windowId: newWin.id, index: -1 }, function () {
            chrome.tabs.query({
              active: true,
              currentWindow: true
            }, function (tabs) {
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