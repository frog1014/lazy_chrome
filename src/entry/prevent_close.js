import {
    ACTIVATED_OBJ_MSG_TYPE,
    ACTIVATED_OBJ_MSG_TARGET,
} from '../assets/js/common'
import {
    TAB_ID_NONE,
} from '../assets/js/common_api'
import '../assets/css/tab.css'
import Api from "../assets/js/api"

(function () {
    function a() {
        console.log('lastTabId in a()', lastTabId)
        window.onbeforeunload = function () {
            return "Would you really like to close your browser?";
        }

        // when clicking on the page, return to last tab user watches
        if (lastTabId > TAB_ID_NONE) {
            Api.getTabById(lastTabId, isFind => {
                isFind && Api.activeTab(lastTabId);
                !isFind && Api.findLastTabElseHandler();
            })
        } else {
            lastTabId == TAB_ID_NONE && Api.findLastTabElseHandler()
        }

        document.let(it => {
            it.querySelector('#prevent_clost_tab_splash').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash")
            it.querySelector('.splash-container').classList.remove('splash-container-inactive')
            it.querySelector('.home-menu').classList.remove('home-menu-inactive')
        })
    }

    var root = document.querySelectorAll('#root')
    var prevent_clost_tab_splash3 = document.querySelectorAll('#prevent_clost_tab_splash3')
    root[0].addEventListener('click', a)
    prevent_clost_tab_splash3[0].addEventListener('click', a)

    var lastTabId = TAB_ID_NONE
    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log('onMessage', msg)
        msg.type == ACTIVATED_OBJ_MSG_TYPE && msg.target == ACTIVATED_OBJ_MSG_TARGET && msg && msg.activatedObj && Api.getCurrentWindow(window => {
            console.log('window', window);
            if (window.id == msg.activatedObj.windowId && msg.activatedObj.lastId) {
                lastTabId = msg.activatedObj.lastId
            }
        })
    })

    document.let(it => {
        it.querySelector('#app_name').innerHTML = Api.getI18nMsg("appName")
        it.querySelector('#prevent_clost_tab_splash').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash_inactive")
        it.querySelector('#prevent_clost_tab_splash2').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash2")
        it.querySelector('#prevent_clost_tab_splash3').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash3", ['<br/>'])
        it.querySelector('#prevent_clost_tab_splash4').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash4")
        it.querySelector('#prevent_clost_tab_splash1').innerHTML = Api.getI18nMsg("prevent_clost_tab_splash1")
        it.onkeypress = function (e) {
            e = e || window.event;
            console.log('onkeypress', e)
            a()
        };
    })
})(window)