const isPreventCloseTabTag = 'isPreventCloseTab'


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

function setStorageData(map, callback) {
    return chrome.storage.sync.set(map, callback);
}

function getStorageData(key, callback) {
    return chrome.storage.sync.get(key, result => {
        callback(result[key])
    });
}

function getCurrentTab(callback) {
    return chrome.tabs.query({
        active: true,
        currentWindow: true
    }, callback)
}

function getTabs(callback) {
    return chrome.tabs.query({
        currentWindow: true
    }, callback)
}

function getI18nMsg(key, ...vars) {
    return chrome.i18n.getMessage(key, vars)
}

function getTabById(id, callback) {
    return chrome.tabs.query({
        currentWindow: true
    }, tabs => {
        var target = tabs.find(tab => {
            return tab.id == id
        })
        callback(target)
    })
}

function activeTab(id) {
    return chrome.tabs.update(id, {
        'active': true
    })
}

function createTab(url) {
    return chrome.tabs.create({
        url: url || 'chrome://newTab/',
    })
}

function getPreventCloseTabUrl() {
    return chrome.runtime.getURL("prevent_close.html")
}