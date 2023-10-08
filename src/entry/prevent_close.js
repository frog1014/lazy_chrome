import {
    TAB_ID_NONE,
} from '../assets/js/common_api'
import '../assets/css/tab.css'
import Api from "../assets/js/api"


(async function () {
    const thisTab = await Api.getCurrentTab()
    let lastTabId = thisTab.openerTabId || TAB_ID_NONE;

    chrome.tabs.onActivated.addListener(tab => {
        console.log('prevent_close.js', tab);
        console.log('thisTab', thisTab);

        if (thisTab && tab && thisTab.windowId == tab.windowId && tab.tabId != thisTab.id) {
            lastTabId = tab.tabId
            console.log('lastTabId', lastTabId);
        }
    })

    async function onKeyPress() {
        console.log('lastTabId in onKeyPress()', lastTabId)
        window.onbeforeunload = function () {
            return "Would you really like to close your browser?";
        }

        // when clicking on the page, return to last tab user watches
        if (lastTabId > TAB_ID_NONE) {
            try {
                let tab = await Api.getTabById(lastTabId)
                console.log('getTabById', tab)
                tab && Api.activeTab(tab.id);
            } catch (error) {
                Api.findLastTabElseHandler();
            }
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
    root[0].addEventListener('click', () => { onKeyPress() })
    prevent_clost_tab_splash3[0].addEventListener('click', () => { onKeyPress() })

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
            onKeyPress()
        };
    })
})(window)