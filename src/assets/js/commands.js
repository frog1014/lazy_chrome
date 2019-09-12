import {
    Common
} from "./common.js"

function newTabWithStr(str) {
    try {
        if (!str) return
        var href = (new URL(str)).href
        chrome.tabs.create({
            url: (href || "https://www.google.com/search?q=" + (str || "")) || "https://www.google.com/"
        })
    } catch (error) {
        console.error(error)
        chrome.tabs.create({
            url: "https://www.google.com/search?q=" + (str || "")
        })
    }
}
export default class Commands {
    static duplicate() {
        Common.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.tabs.duplicate(current.id);
        });
    }

    static toShutUp() {
        chrome.tabs.query({
            currentWindow: true,
            audible: true
        }, tabs => {
            Common.getCurrentTab(current => {
                tabs.forEach(element => {
                    chrome.tabs.update(element.id, {
                        'muted': element.id == current[0].id ? current[0].mutedInfo.muted : true
                    });
                })
            })
        });
    }

    static toggleMute() {
        Common.getCurrentTab(tabs => {
            var current = tabs[0]
            console.log(current)
            chrome.tabs.update(current.id, {
                'muted': !current.mutedInfo.muted
            });
        });
    }

    static independent() {
        Common.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.windows.create({
                focused: true,
                type: 'normal'
            }, newWin => {
                chrome.tabs.move(current.id, {
                    windowId: newWin.id,
                    index: -1
                }, _ => {
                    Common.getCurrentTab(tabs => {
                        chrome.tabs.remove(tabs[0].id);
                    })
                });
            })
        });
    }
    static openNotepad() {
        chrome.tabs.create({
            url: "data:text/html, <html contenteditable>"
        })
    }
    static newQueryWithSelected() {
        chrome.tabs.executeScript({
            code: "window.getSelection().toString();"
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
        var clipboardContents = Common.getPasted()
        chrome.tabs.create({
            url: "https://www.google.com/search?q=" + (clipboardContents || "")
        })
    }

    static newTabWithUrl() {
        let clipboardContents = Common.getPasted()
        newTabWithStr(clipboardContents)
    }

    static keepSameDomain() {
        Common.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Common.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Common.isPreventClose(value => {
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
        Common.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Common.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Common.isPreventClose(value => {
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
        Common.getCurrentTab(currentTab => {
            var preventCloseTabUrl = Common.getPreventCloseTabUrl()
            if (currentTab[0].url == preventCloseTabUrl) return
            var currentDomain = (new URL(currentTab[0].url)).hostname
            try {
                Common.isPreventClose(value => {
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
        Common.getCurrentTab(tabs => {
            var current = tabs[0]
            chrome.tabs.update(current.id, {
                'pinned': !current.pinned
            });
        });
    }
}