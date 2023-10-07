import {
    IS_PREVENT_CLOSE_TAB_TAG,
    IS_BOOKMARK_TITLE_SIMPLIFIER_TAG,
    COPY_PASTE_DATA_TO_CLIPBOARD_MSG_TYPE,
    COPY_DATA_TO_CLIPBOARD_MSG_TYPE,
    OFFSCREEN_PASTE_DONE_MSG_TARGET,
    OFFSCREEN_COPY_DONE_MSG_TARGET,
    NEW_TAB_URL,
} from "./common"
export default class Api {

    static getPasted(callback) {
        let listener = (msg) => {
            console.log(msg)
            if (msg.target !== OFFSCREEN_PASTE_DONE_MSG_TARGET) {
                return;
            }
            callback(msg.data)
            Api.runtimeOnMessageRemoveListener(listener)
        }

        Api.runtimeOnMessageAddListener(listener)
        return addFromPasteToClipboard()
    }

    static async chromeCommandsGetAll() {
        return await chrome.commands.getAll()
    }

    static async createTab(param = {
        url: NEW_TAB_URL,
    }) {
        return await chrome.tabs.create(param)
    }
    static async queryTabs(param = {}) {
        return await chrome.tabs.query(param)
    }
    static async executeScript(param = {}) {
        return await chrome.scripting.executeScript(param)
    }
    static async createWindow(param = {}) {
        return await chrome.windows.create(param)
    }

    static copyInjected(str, callback) {
        let listener = (msg) => {
            console.log(msg)
            if (msg.target !== OFFSCREEN_COPY_DONE_MSG_TARGET) {
                return;
            }
            callback(msg.data)
            Api.runtimeOnMessageRemoveListener(listener)
        }

        Api.runtimeOnMessageAddListener(listener)
        return addToClipboard(str)
    }

    static async setStorageData(map) {
        return await chrome.storage.local.set(map);
    }
    static async getStorageData(key) {
        let result = await chrome.storage.local.get(key)
        return result[key]
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

    static async getCurrentTab() {
        return (await Api.queryTabs({
            active: true,
            currentWindow: true
        }))[0]
    }

    static getLastFocused(callback, param = {}) {
        return chrome.windows.getLastFocused(param, callback)
    }

    static async getCurrentWindow(param = {}) {
        return await chrome.windows.getCurrent(param)
    }

    static async getWindow(id, param = {}) {
        return await chrome.windows.get(id, param)
    }
    static async moveTab(id, param = {}) {
        return await chrome.tabs.move(id, param)
    }
    static async offscreenCloseDocument() {
        await chrome.offscreen.closeDocument()
    }

    static async getTabs() {
        return await Api.queryTabs({
            currentWindow: true
        })
    }

    static getI18nMsg(key, ...vars) {
        return chrome.i18n.getMessage(key, vars) || ""
    }

    static async getTabById(id) {
        return await chrome.tabs.get(id)
    }
    static async duplicateTab(id) {
        return await chrome.tabs.duplicate(id)
    }

    static activeWindow(id, callback) {
        return chrome.windows.update(id, {
            focused: true
        }, callback)
    }

    static async activeTab(id) {
        return await Api.updateTabs(id, {
            'active': true
        })
    }

    static async updateTabs(id, param) {
        return await chrome.tabs.update(id, param)
    }
    static async removeTabs(ids) {
        return await chrome.tabs.remove(ids)
    }
    static runtimeOnMessageAddListener(listener) {
        chrome.runtime.onMessage.addListener(listener)
    }
    static async chromeRuntimeSendMessage(msg) {
        await chrome.runtime.sendMessage(msg)
    }
    static runtimeOnMessageRemoveListener(listener) {
        chrome.runtime.onMessage.removeListener(listener)
    }
    static renameBookmark(id, title, callback) {
        return chrome.bookmarks.update(id, {
            title
        }, callback)
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
        Api.queryTabs(
            Object.assign({
                currentWindow: true
            }, param)).then(tabs => {
                console.log('tabs', tabs);
                tabs.length > 0 && Api.activeTab(tabs[tabs.length - 1].id);
                (tabs.length < 1 || (tabs.length == 1 && tabs[0].url == Api.getPreventCloseTabUrl())) && Api.createTab()
            })
    }
}

const offScreenFile = 'offscreen.html';
async function addFromPasteToClipboard() {
    await setupOffscreenDocument(offScreenFile)
    Api.chromeRuntimeSendMessage({
        type: COPY_PASTE_DATA_TO_CLIPBOARD_MSG_TYPE,
        target: 'offscreen-doc',
    });
}
async function addToClipboard(value) {
    await setupOffscreenDocument(offScreenFile)
    // Now that we have an offscreen document, we can dispatch the
    // message.
    Api.chromeRuntimeSendMessage({
        type: COPY_DATA_TO_CLIPBOARD_MSG_TYPE,
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