export const IS_PREVENT_CLOSE_TAB_TAG = 'isPreventCloseTab'
export const NEW_TAB_URL = 'chrome://newtab/'
export const CONTENTEDITABLE_URL = 'data:text/html, <html contenteditable>'
export const EXTENSIONS_URL = 'chrome://extensions/shortcuts'
export const TAB_ID_NONE = chrome.tabs.TAB_ID_NONE
export class Common {

    static getPasted() {
        let bg = chrome.extension.getBackgroundPage(); // get the background page
        bg.document.body.innerHTML = ""; // clear the background page

        // add a DIV, contentEditable=true, to accept the paste action
        var helperdiv = bg.document.createElement("input");
        document.body.appendChild(helperdiv);
        helperdiv.focus();
        // trigger the paste action
        bg.document.execCommand("Paste");

        // read the clipboard contents from the helperdiv
        return helperdiv.value || "";
    }

    static setStorageData(map, callback) {
        return chrome.storage.sync.set(map, callback);
    }
    static getStorageData(key, callback) {
        return chrome.storage.sync.get(key, result => {
            callback(result[key])
        });
    }

    static isPreventClose(callback) {
        return chrome.storage.sync.get(IS_PREVENT_CLOSE_TAB_TAG, result => {
            callback(result[IS_PREVENT_CLOSE_TAB_TAG])
        });
    }

    static getCurrentTab(callback) {
        return chrome.tabs.query({
            active: true,
            currentWindow: true
        }, callback)
    }

    static getTabs(callback) {
        return chrome.tabs.query({
            currentWindow: true
        }, callback)
    }

    static getI18nMsg(key, ...vars) {
        return chrome.i18n.getMessage(key, vars) || ""
    }

    static getTabById(id, callback) {
        return Common.getTabs(tabs => {
            callback(tabs.find(tab => tab.id == id))
        })
    }

    static activeTab(id) {
        return chrome.tabs.update(id, {
            'active': true
        })
    }

    static createTab(url) {
        return chrome.tabs.create({
            url: url || NEW_TAB_URL,
        })
    }

    static getPreventCloseTabUrl() {
        return chrome.runtime.getURL("prevent_close.html") || ""
    }

    static findLastTabElseHandler(param = {
        pinned: false
    }) {
        return chrome.tabs.query(
            Object.assign({
                currentWindow: true
            }, param), tabs => {
                console.log('tabs', tabs);
                tabs.length > 0 && Common.activeTab(tabs[tabs.length - 1].id);
                (tabs.length < 1 || (tabs.length == 1 && tabs[0].url == Common.getPreventCloseTabUrl())) && Common.createTab()
            })
    }
}