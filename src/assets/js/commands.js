import {
    GOOGLE_SEARCH_URL,
} from "./const"
import {
    TAB_ID_NONE
} from "./const_api"
import Api from "./api"


function newTabWithStr(str, index) {
    try {
        if (!str) return;

        new URL(str).let(it => {
            if (it.host.length == 0 || it.hostname.length == 0) throw ('invalid URL');

            ((it.href || GOOGLE_SEARCH_URL + (encodeURIComponent(str) || "")) || 'https://www.google.com/').let(newUrl => {
                Api.createTab({
                    url: newUrl,
                    index
                })
            });
        });
    } catch (error) {
        console.error(error)
        const newLocal = (encodeURIComponent(str) || "")
        Api.createTab({
            url: GOOGLE_SEARCH_URL + newLocal,
            index
        })
    }
}

class Commands {
    async duplicate() {
        Api.duplicateTab((await Api.getCurrentTab()).id);
    }

    previousTabLastWindow(windowsHistory = []) {
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

    previousTabInSameWindow(windowsHistory = []) {
        Api.getCurrentWindow().then(window => {
            (windowsHistory.find(e => e.windowId == window.id) || false).let(async it => {
                try {
                    if (it && it.lastId != TAB_ID_NONE)
                        await Api.activeTab(it.lastId)
                } catch (error) {
                    console.error('activeTab', it.lastId)
                }
            })
        })
    }

    async toShutUp() {
        let current = await Api.getCurrentTab()
        current && (await Api.queryTabs({
            currentWindow: true,
            audible: true
        })).forEach(element => {
            Api.updateTabs(element.id, {
                'muted': element.id == current.id ? current.mutedInfo.muted : true
            });
        })
    }

    async toggleMute() {
        (await Api.getCurrentTab())
            .let(current => {
                console.log(current)
                Api.updateTabs(current.id, {
                    'muted': !current.mutedInfo.muted
                });
            })
    }

    async independent() {
        var tab = await Api.getCurrentTab()
        console.log(tab);

        tab && (await Api.createWindow({
            focused: true,
            type: 'normal'
        })).let(async newWin =>
            await Api.moveTab(tab.id, {
                windowId: newWin.id,
                index: -1
            }))
            .then(() => Api.getCurrentTab())
            .then(tab => Api.removeTabs(tab.id))
    }

    openNotepad() {
        Api.createTab({
            url: 'data:text/html, <html contenteditable>'
        })
    }
    async newQueryWithSelected() {
        let current = await Api.getCurrentTab()
        let index = current.index + 1
        Api.executeScript({
            target: { tabId: current.id },
            func: () => window.getSelection().toString()
        }).then((result) => {
            if (result) {
                let clipboardContents = result[0].result
                newTabWithStr(clipboardContents, index)
            } else {
                alert('Not support on this page')
            }
        });
    }
    async newQueryWithPasted() {
        let index = await Api.getNewIndex()
        Api.getPasted((clipboardContents) => Api.createTab({
            url: GOOGLE_SEARCH_URL + encodeURIComponent(clipboardContents || ''),
            index
        }))
    }

    async copyUrl() {
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
    async copyTitleAndUrl() {
        let current = await Api.getCurrentTab();
        (current || false).let(current => {
            current && ({
                type: 'basic',
                iconUrl: 'images/lazy_chrome48.png?raw=true',
                'message': current.title + " " + current.url
            }).let(it => {
                let callback = (result) => {
                    it['title'] = (result ? 'copySuccessful' : 'copyFailed').let(Api.getI18nMsg)
                    Api.createNotifications('copyInjected', it)
                }

                Api.copyInjected(it.message, callback)
            })
        })
    }

    async newTabWithUrl() {
        let index = await Api.getNewIndex()
        Api.getPasted(content => newTabWithStr(content, index))
    }


    async uniqueTabs() {
        try {
            let tabs = await Api.queryTabs({
                currentWindow: true,
            });
            let toRemoveIds = []
            let sorted = tabs.sort((a, b) => a.url > b.url ? 1 : -1)

            for (let index = 0; index < sorted.length; index++) {
                const element = sorted[index];
                if (index > 0) {
                    if (element.url == sorted[index - 1].url) {
                        toRemoveIds.push(element.id)
                    }
                }
            }

            toRemoveIds.length > 0 && Api.removeTabs(toRemoveIds)
        } catch (error) {
            console.log('uniqueTabs', error)
        }
    }


    async uniqueTabs() {
        try {
            let tabs = await Api.queryTabs({
                currentWindow: true,
            });
            let toRemoveIds = []
            let sorted = tabs.sort((a, b) => a.url > b.url ? 1 : -1)

            for (let index = 0; index < sorted.length; index++) {
                const element = sorted[index];
                if (index > 0) {
                    if (element.url == sorted[index - 1].url) {
                        toRemoveIds.push(element.id)
                    }
                }
            }

            toRemoveIds.length > 0 && Api.removeTabs(toRemoveIds)
        } catch (error) {
            console.log('uniqueTabs', error)
        }
    }

    async keepSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            let value = await Api.isPreventClose()
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
                it.length > 0 && Api.removeTabs(it)
            })
        } catch (error) {
            console.error(error)
        }
    }
    async killOtherSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            let value = await Api.isPreventClose()
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
                it.length > 0 && Api.removeTabs(it)
            })
        } catch (error) {
            console.error(error)
        }
    }
    async killSameDomain() {
        let currentTab = await Api.getCurrentTab()
        var preventCloseTabUrl = Api.getPreventCloseTabUrl()
        if (currentTab.url == preventCloseTabUrl) return
        var currentDomain = (new URL(currentTab.url)).hostname
        try {
            let value = Api.isPreventClose()
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
                it.length > 0 && Api.removeTabs(it)
            })
        } catch (error) {
            console.error(error)
        }
    }
    togglePin() {
        Api.getCurrentTab().then(current => {
            Api.updateTabs(current.id, {
                'pinned': !current.pinned
            });
        });
    }


}
let commands = new Commands()
export default class CommandsDispatcher {
    static dispatch(command, windowsHistory) {
        switch (command) {
            case "toggle-pin": {
                commands.togglePin();
                break;
            }

            case "toggle-mute": {
                commands.toggleMute();
                break;
            }

            case "previousTabInSameWindow": {
                commands.previousTabInSameWindow(windowsHistory);
                break;
            }

            case "previousTabLastWindow": {
                commands.previousTabLastWindow(windowsHistory);
                break;
            }

            case "toShutUp": {
                commands.toShutUp();
                break;
            }

            case "duplicate": {
                commands.duplicate();
                break;
            }

            case "independent": {
                commands.independent();
                break;
            }

            case "newTabWithUrl": {
                commands.newTabWithUrl();
                break;
            }

            case "newQueryWithPasted": {
                commands.newQueryWithPasted();
                break;
            }

            case "newQueryWithSelected": {
                commands.newQueryWithSelected();
                break;
            }

            case "openNotepad": {
                commands.openNotepad();
                break;
            }

            case "copyUrl": {
                commands.copyUrl();
                break;
            }

            case "copyTitleAndUrl": {
                commands.copyTitleAndUrl();
                break;
            }
            case "uniqueTabs": {
                commands.uniqueTabs();
                break;
            }

            case "killSameDomain": {
                commands.killSameDomain();
                break;
            }

            case "killOtherSameDomain": {
                commands.killOtherSameDomain();
                break;
            }
            case "keepSameDomain": {
                commands.keepSameDomain();
                break;
            }
        }
    }
}
