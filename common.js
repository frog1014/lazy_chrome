const IS_PREVENT_CLOSE_TAB_TAG = 'isPreventCloseTab'
const NEW_TAB_URL = 'chrome://newtab/'
const CONTENTEDITABLE_URL = 'data:text/html, <html contenteditable>'
const EXTENSIONS_URL = 'chrome://extensions/shortcuts'

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

function isPreventClose(callback) {
    return chrome.storage.sync.get(IS_PREVENT_CLOSE_TAB_TAG, result => {
        callback(result[IS_PREVENT_CLOSE_TAB_TAG])
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
    return getTabs(tabs => {
        callback(tabs.find(tab => tab.id == id))
    })
}

function activeTab(id) {
    return chrome.tabs.update(id, {
        'active': true
    })
}

function createTab(url) {
    return chrome.tabs.create({
        url: url || NEW_TAB_URL,
    })
}

function getPreventCloseTabUrl() {
    return chrome.runtime.getURL("prevent_close.html")
}