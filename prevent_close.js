(function () {
    function a() {
        console.log('lastTabId', lastTabId)
        window.onbeforeunload = function () {
            return "Would you really like to close your browser?";
        }

        if (lastTabId > -1) {
            getTabById(lastTabId, isFind => {
                isFind && activeTab(lastTabId);
                !isFind && elseHandler();
            })
        } else {
            (lastTabId == -1) && elseHandler()
        }

        document.querySelector('#prevent_clost_tab_splash').innerHTML = getI18nMsg("prevent_clost_tab_splash")
        document.querySelector('.splash-container').classList.remove('splash-container-inactive')
        document.querySelector('.home-menu').classList.remove('home-menu-inactive')
    }

    var root = document.querySelectorAll('#root')
    var prevent_clost_tab_splash3 = document.querySelectorAll('#prevent_clost_tab_splash3')
    root[0].addEventListener('click', a)
    prevent_clost_tab_splash3[0].addEventListener('click', a)

    var lastTabId = -1
    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log('onMessage', msg)
        if (msg.activatedObj) {
            chrome.windows.getCurrent({}, window => {
                if (window.id == msg.activatedObj.windowId && msg.activatedObj.lastId)
                    lastTabId = msg.activatedObj.lastId
            })
        }
    })

    function elseHandler() {
        return chrome.tabs.query({
            currentWindow: true,
            pinned: false
        }, tabs => {
            console.log('tabs', tabs);
            tabs.length > 0 && activeTab(tabs[tabs.length - 1].id);
            (tabs.length < 1 || (tabs.length == 1 && tabs[0].url == getPreventCloseTabUrl())) && createTab()
        })
    }

    document.querySelector('#app_name').innerHTML = getI18nMsg("appName")
    document.querySelector('#prevent_clost_tab_splash').innerHTML = getI18nMsg("prevent_clost_tab_splash_inactive")
    document.querySelector('#prevent_clost_tab_splash2').innerHTML = getI18nMsg("prevent_clost_tab_splash2")
    document.querySelector('#prevent_clost_tab_splash3').innerHTML = getI18nMsg("prevent_clost_tab_splash3", ['<br/>'])
    document.querySelector('#prevent_clost_tab_splash4').innerHTML = getI18nMsg("prevent_clost_tab_splash4")
    document.querySelector('#prevent_clost_tab_splash1').innerHTML = getI18nMsg("prevent_clost_tab_splash1")
    document.onkeypress = function (e) {
        e = e || window.event;
        console.log('onkeypress', e)
        a()
    };
})(window)