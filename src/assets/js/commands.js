import {
    GOOGLE_SEARCH_URL,
} from "./common.js"
import {
    TAB_ID_NONE
} from "./common_api.js"
import Api from "./api"

function newTabWithStr(str) {
    try {
        if (!str) return;

        new URL(str).let(it => {
            if (it.host.length == 0 || it.hostname.length == 0) throw ('invalid URL');

            ((it.href || GOOGLE_SEARCH_URL + (encodeURIComponent(str) || "")) || 'https://www.google.com/').let(newUrl => {
                Api.createTab({
                    url: newUrl
                })
            });
        });
    } catch (error) {
        console.error(error)
        const newLocal = (encodeURIComponent(str) || "")
        Api.createTab({
            url: GOOGLE_SEARCH_URL + newLocal
        })
    }
}
export default class Commands {
    static async duplicate() {
        chrome.tabs.duplicate((await Api.getCurrentTab()).id);
    }

    static previousTabLastWindow(windowsHistory = []) {
        // Api.getCurrentWindow(window => {
        //     console.log("getCurrentWindow", window);
        //     var previousWindow
        //     for (let i = windowsHistory.length - 1; i >= 0; i--) {
        //         (windowsHistory[i] || false).let(e => {
        //             if (e && e.windowId != window.id)
        //                 previousWindow = e;
        //         })
        //         if (previousWindow) break;
        //     }
        //     console.log('previousWindow', previousWindow)
        //     previousWindow && previousWindow.windowId != WINDOW_ID_NONE &&
        //         Api.activeWindow(previousWindow.windowId, window => {
        //             window && previousWindow.lastId != TAB_ID_NONE && Api.activeTab(previousWindow.lastId)
        //         });

        //     // !previousTabInSameWindow && previousTabInSameWindow(windowsHistory)
        // })
    }

    static previousTabInSameWindow(windowsHistory = []) {
        Api.getCurrentWindow(window => {
            (windowsHistory.find(e => e.windowId == window.id) || false).let(it =>
                it && it.lastId != TAB_ID_NONE && Api.activeTab(it.lastId)
            )
        })
    }

    static async toShutUp() {
        let current = await Api.getCurrentTab()
        current && (await Api.queryTabs({
            currentWindow: true,
            audible: true
        })).forEach(element => {
            chrome.tabs.update(element.id, {
                'muted': element.id == current.id ? current.mutedInfo.muted : true
            });
        })
    }

    static async toggleMute() {
        (await Api.getCurrentTab())
            .let(current => {
                console.log(current)
                chrome.tabs.update(current.id, {
                    'muted': !current.mutedInfo.muted
                });
            })
    }

    static async independent() {
        var current = await Api.getCurrentTab()
        console.log(current);

        (await chrome.windows.create({
            focused: true,
            type: 'normal'
        })).let(async newWin =>
            await chrome.tabs.move(current.id, {
                windowId: newWin.id,
                index: -1
            }))
            .then(() => Api.getCurrentTab())
            .then(tab => chrome.tabs.remove(tab.id))
    }

    static openNotepad() {
        chrome.tabs.create({
            url: 'data:text/html, <html contenteditable>'
        })
    }
    static async newQueryWithSelected() {
        let current = await Api.getCurrentTab()
        chrome.scripting.executeScript({
            target: { tabId: current.id },
            func: () => window.getSelection().toString()
        }).then((result) => {
            if (result) {
                let clipboardContents = result[0].result
                newTabWithStr(clipboardContents)
            } else {
                alert('Not support on this page')
            }
        });
    }
    static newQueryWithPasted() {
        Api.getPasted((clipboardContents) => chrome.tabs.create({
            url: GOOGLE_SEARCH_URL + encodeURIComponent(clipboardContents || '')
        }))
    }

    static async copyUrl() {
        let current = await Api.getCurrentTab();
        (current.url || false).let(url => {
            url && ({
                type: 'basic',
                iconUrl: 'images/lazy_chrome48.png?raw=true',
                'message': url
            }).let(it => {
                let callback = (result) => {
                    it['title'] = (result ? 'copySuccessful' : 'copyFailed').let(Api.getI18nMsg)
                    Api.createNotifications('copyInjected', it)
                }

                Api.copyInjected(url, callback)
            })
        })
    }

    static newTabWithUrl() {
        Api.getPasted((clipboardContents) => newTabWithStr(clipboardContents))
    }

    static async keepSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            Api.isPreventClose(async value => {
                let tabs = await Api.queryTabs({
                    currentWindow: true,
                    pinned: false
                });

                [].let(it => {
                    tabs.forEach(tab => {
                        var domain = (new URL(tab.url)).hostname
                        if (domain != currentDomain &&
                            ((value && tab.url != preventCloseTabUrl) ||
                                !value)) {
                            it.push(tab.id)
                        }
                    })
                    it.length > 0 && chrome.tabs.remove(it)
                })
            })
        } catch (error) {
            console.error(error)
        }
    }
    static async killOtherSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            Api.isPreventClose(async value => {
                let tabs = await Api.queryTabs({
                    currentWindow: true,
                    pinned: false
                });
                [].let(it => {
                    tabs.forEach(tab => {
                        var domain = (new URL(tab.url)).hostname
                        if (tab.id != currentTab.id &&
                            !(domain != currentDomain &&
                                ((value && tab.url != preventCloseTabUrl) ||
                                    !value))) {
                            it.push(tab.id)
                        }
                    })
                    it.length > 0 && chrome.tabs.remove(it)
                })
            })
        } catch (error) {
            console.error(error)
        }
    }
    static async killSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            Api.isPreventClose(async value => {
                let tabs = await Api.queryTabs({
                    currentWindow: true,
                    pinned: false
                });
                [].let(it => {
                    tabs.forEach(tab => {
                        var domain = (new URL(tab.url)).hostname
                        if (!(domain != currentDomain &&
                            ((value && tab.url != preventCloseTabUrl) ||
                                !value))) {
                            it.push(tab.id)
                        }
                    })
                    it.length > 0 && chrome.tabs.remove(it)
                })
            })
        } catch (error) {
            console.error(error)
        }
    }
    static async togglePin() {
        (await Api.getCurrentTab()).let(current => {
            chrome.tabs.update(current.id, {
                'pinned': !current.pinned
            });
        });
    }
}