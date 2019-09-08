import {
    TAB_ID_NONE,
    Common
} from "../assets/js/common.js"

(function () {
    function a() {
        console.log('lastTabId', lastTabId)
        window.onbeforeunload = function () {
            return "Would you really like to close your browser?";
        }

        if (lastTabId > TAB_ID_NONE) {
            Common.getTabById(lastTabId, isFind => {
                isFind && Common.activeTab(lastTabId);
                !isFind && Common.findLastTabElseHandler();
            })
        } else {
            lastTabId == TAB_ID_NONE && Common.findLastTabElseHandler()
        }

        document.querySelector('#prevent_clost_tab_splash').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash")
        document.querySelector('.splash-container').classList.remove('splash-container-inactive')
        document.querySelector('.home-menu').classList.remove('home-menu-inactive')
    }

    var root = document.querySelectorAll('#root')
    var prevent_clost_tab_splash3 = document.querySelectorAll('#prevent_clost_tab_splash3')
    root[0].addEventListener('click', a)
    prevent_clost_tab_splash3[0].addEventListener('click', a)

    var lastTabId = TAB_ID_NONE
    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log('onMessage', msg)
        if (msg.activatedObj) {
            chrome.windows.getCurrent({}, window => {
                if (window.id == msg.activatedObj.windowId && msg.activatedObj.lastId)
                    lastTabId = msg.activatedObj.lastId
            })
        }
    })

    document.querySelector('#app_name').innerHTML = Common.getI18nMsg("appName")
    document.querySelector('#prevent_clost_tab_splash').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash_inactive")
    document.querySelector('#prevent_clost_tab_splash2').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash2")
    document.querySelector('#prevent_clost_tab_splash3').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash3", ['<br/>'])
    document.querySelector('#prevent_clost_tab_splash4').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash4")
    document.querySelector('#prevent_clost_tab_splash1').innerHTML = Common.getI18nMsg("prevent_clost_tab_splash1")
    document.onkeypress = function (e) {
        e = e || window.event;
        console.log('onkeypress', e)
        a()
    };
})(window)