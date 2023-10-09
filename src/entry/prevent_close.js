import {
    TAB_ID_NONE,
} from '../assets/js/const_api'
import {
    PREVENT_CLOSE_TAB_MSG_TYPE,
    GO_TO_LAST_TAB_MSG_TARGET,
} from "../assets/js/const"
import '../assets/css/tab.css'
import Api from "../assets/js/api"


(async function () {
    const thisTab = await Api.getCurrentTab()

    async function onKeyPress() {
        window.onbeforeunload = function () {
            return "Would you really like to close your browser?";
        }

        Api.chromeRuntimeSendMessage({
            type: PREVENT_CLOSE_TAB_MSG_TYPE,
            target: GO_TO_LAST_TAB_MSG_TARGET,
            data: {
                currentTab: thisTab,
            }
        })

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