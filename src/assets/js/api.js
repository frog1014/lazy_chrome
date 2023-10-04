import {
    IS_PREVENT_CLOSE_TAB_TAG,
    IS_BOOKMARK_TITLE_SIMPLIFIER_TAG,
    NEW_TAB_URL,
} from "./common"
export default class Api {

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

    static async copyInjected(str) {
        return await addToClipboard(str)
    }

    static setStorageData(map, callback) {
        return chrome.storage.local.set(map, callback);
    }
    static getStorageData(key, callback) {
        return chrome.storage.local.get(key, result => {
            callback(result[key])
        });
    }

    static isPreventClose(callback) {
        return chrome.storage.local.get(IS_PREVENT_CLOSE_TAB_TAG, result => {
            callback(result[IS_PREVENT_CLOSE_TAB_TAG])
        });
    }

    static isBookmarkTitleSimplifier(callback) {
        return chrome.storage.local.get(IS_BOOKMARK_TITLE_SIMPLIFIER_TAG, result => {
            callback(result[IS_BOOKMARK_TITLE_SIMPLIFIER_TAG])
        });
    }

    static getCurrentTab(callback) {
        return chrome.tabs.query({
            active: true,
            currentWindow: true
        }, callback)
    }

    static getLastFocused(callback, param = {}) {
        return chrome.windows.getLastFocused(param, callback)
    }

    static getCurrentWindow(callback, param = {}) {
        return chrome.windows.getCurrent(param, callback)
    }

    static getWindow(id, callback, param = {}) {
        return chrome.windows.get(id, param, callback)
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
        return Api.getTabs(tabs => {
            callback(tabs.find(tab => tab.id == id))
        })
    }

    static activeWindow(id, callback) {
        return chrome.windows.update(id, {
            focused: true
        }, callback)
    }

    static activeTab(id) {
        return chrome.tabs.update(id, {
            'active': true
        })
    }

    static renameBookmark(id, title, callback) {
        return chrome.bookmarks.update(id, {
            title
        }, callback)
    }

    static createTab(url) {
        return chrome.tabs.create({
            url: url || NEW_TAB_URL,
        })
    }

    static createNotifications(id = '', notificationOptions = {}, callback) {
        Object.assign({}, notificationOptions).let(it => {
            console.log(it)
            return chrome.notifications.create(id + Api.getNow(), it, callback)
        })
    }

    static getPreventCloseTabUrl() {
        return chrome.runtime.getURL("prevent_close.html") || ""
    }

    static async startAlarm(name, durationInMills) {
        await chrome.alarms.create(name, { when: Api.getNow() + durationInMills });
    }

    static getNow() {
        return +new Date;
    }

    static async clearAlarm(name, callback) {
        await chrome.alarms.clear(name, callback)
    }

    static onAlarm(name, callback) {
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name == name) {
                callback()
            }
        });
    }

    static findLastTabElseHandler(param = {
        pinned: false
    }) {
        return chrome.tabs.query(
            Object.assign({
                currentWindow: true
            }, param), tabs => {
                console.log('tabs', tabs);
                tabs.length > 0 && Api.activeTab(tabs[tabs.length - 1].id);
                (tabs.length < 1 || (tabs.length == 1 && tabs[0].url == Api.getPreventCloseTabUrl())) && Api.createTab()
            })
    }
}

async function addToClipboard(value) {
    await setupOffscreenDocument('offscreen.html');;
    // Now that we have an offscreen document, we can dispatch the
    // message.
    chrome.runtime.sendMessage({
        type: 'copy-data-to-clipboard',
        target: 'offscreen-doc',
        data: value
    });
}

let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
    // Check all windows controlled by the service worker to see if one 
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            reasons: ['CLIPBOARD'],
            justification: 'Write text to the clipboard.',
        });
        await creating;
        creating = null;
    }
}