import {
    // GOOGLE_SEARCH_URL,
    COMMAND_KEY,
    // TAB_ID_NONE
} from "./common.js"
import Api from "./api"

function newTabWithStr(str) {
    try {
        if (!str) return;

        new URL(str).let(it => {
            if (it.host.length == 0 || it.hostname.length == 0) throw ('invalid URL');

            ((it.href || GOOGLE_SEARCH_URL + (encodeURIComponent(str) || "")) || 'https://www.google.com/').let(newUrl => {
                chrome.tabs.create({
                    url: newUrl
                })
            });
        });
    } catch (error) {
        console.error(error)
        const newLocal = (encodeURIComponent(str) || "")
        chrome.tabs.create({
            url: GOOGLE_SEARCH_URL + newLocal
        })
    }
}

function sendPageCommand(command) {
    Api.getCurrentTab(tabs => {
        var current = tabs[0]
        console.log('current', current)
        chrome.tabs.sendMessage(current.id, {
            [COMMAND_KEY]: command
        });
    });
}
export default class Commands {
    static duplicate() {
        Api.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.tabs.duplicate(current.id);
        });
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

    static toShutUp() {
        chrome.tabs.query({
            currentWindow: true,
            audible: true
        }, tabs => {
            Api.getCurrentTab(current => {
                tabs.forEach(element => {
                    chrome.tabs.update(element.id, {
                        'muted': element.id == current[0].id ? current[0].mutedInfo.muted : true
                    });
                })
            })
        });
    }

    static toggleMute() {
        Api.getCurrentTab(tabs => {
            var current = tabs[0]
            console.log(current)
            chrome.tabs.update(current.id, {
                'muted': !current.mutedInfo.muted
            });
        });
    }



    static nextPage() {
        sendPageCommand('nextPage');
    }

    static previousPage() {
        sendPageCommand('previousPage')
    }

    static lastPage() {
        sendPageCommand('lastPage')
    }

    static firstPage() {
        sendPageCommand('firstPage')
    }

    static listPage() {
        sendPageCommand('listPage')
    }

    static independent() {
        Api.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.windows.create({
                focused: true,
                type: 'normal'
            }, newWin => {
                chrome.tabs.move(current.id, {
                    windowId: newWin.id,
                    index: -1
                }, _ => {
                    Api.getCurrentTab(tabs => {
                        chrome.tabs.remove(tabs[0].id);
                    })
                });
            })
        });
    }
    static openNotepad() {
        chrome.tabs.create({
            url: 'data:text/html, <html contenteditable>'
        })
    }
    static newQueryWithSelected() {
        chrome.tabs.executeScript({
            code: 'window.getSelection().toString();'
        }, selection => {
            if (selection) {
                let clipboardContents = selection[0]
                newTabWithStr(clipboardContents)
            } else {
                alert('Not support on this page')
            }
        });
    }
    static newQueryWithPasted() {
        var clipboardContents = Api.getPasted()
        chrome.tabs.create({
            url: GOOGLE_SEARCH_URL + encodeURIComponent(clipboardContents || '')
        })
    }

    static copyUrl() {
        Api.getCurrentTab(tab => {
            (tab[0].url || false).let(url => {
                url && ({
                    type: 'basic',
                    iconUrl: 'images/lazy_chrome48.png?raw=true',
                    'message': url
                }).let(it => {
                    it['title'] = (Api.copyInjected(url) ? 'copySuccessful' : 'copyFailed').let(Api.getI18nMsg)
                    Api.createNotifications('copyInjected', it)
                })
            })
        })
    }

    static newTabWithUrl() {
        let clipboardContents = Api.getPasted()
        newTabWithStr(clipboardContents)
    }

    static keepSameDomain() {
        Api.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Api.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Api.isPreventClose(value => {
                    chrome.tabs.query({
                        currentWindow: true,
                        pinned: false
                    }, tabs => {
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
                })
            } catch (error) {
                console.error(error)
            }
        })
    }
    static killOtherSameDomain() {
        Api.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Api.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Api.isPreventClose(value => {
                    chrome.tabs.query({
                        currentWindow: true,
                        pinned: false
                    }, tabs => {
                        [].let(it => {
                            tabs.forEach(tab => {
                                var domain = (new URL(tab.url)).hostname
                                if (tab.id != currentTab[0].id &&
                                    !(domain != currentDomain &&
                                        ((value && tab.url != preventCloseTabUrl) ||
                                            !value))) {
                                    it.push(tab.id)
                                }
                            })
                            it.length > 0 && chrome.tabs.remove(it)
                        })
                    })
                })
            } catch (error) {
                console.error(error)
            }
        })
    }
    static killSameDomain() {
        Api.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Api.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Api.isPreventClose(value => {
                    chrome.tabs.query({
                        currentWindow: true,
                        pinned: false
                    }, tabs => {
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
                })
            } catch (error) {
                console.error(error)
            }
        })
    }
    static togglePin() {
        Api.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.tabs.update(current.id, {
                'pinned': !current.pinned
            });
        });
    }
}