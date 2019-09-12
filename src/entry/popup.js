import {
    IS_PREVENT_CLOSE_TAB_TAG,
    EXTENSIONS_URL,
    Common
} from "../assets/js/common.js"
import '../assets/css/popup.css'

(function () {

    document.querySelector('#popup_splash_1').innerHTML = Common.getI18nMsg("appDesc")
    document.querySelector('#go_shortcut_setting').applyy(_ => {
        _.innerHTML = '<i class="fa fa-cog"></i> ' + Common.getI18nMsg("go_shortcut_setting")
        _.addEventListener('click', event => {
            chrome.tabs.create({
                url: EXTENSIONS_URL
            })
        })
    })

    var checkPreventCloseTab = document.querySelector('#check-prevent-close-tab')
    Common.getStorageData(IS_PREVENT_CLOSE_TAB_TAG, value => {
        checkPreventCloseTab.checked = value
    })

    checkPreventCloseTab.addEventListener('change', e => {
        Common.setStorageData({
            [IS_PREVENT_CLOSE_TAB_TAG]: e.target.checked
        }, _ => {
            console.log('ok')
            e.target.checked && Common.getTabs(tabs => {
                var targetUrl = Common.getPreventCloseTabUrl();
                !tabs.find(tab => tab.url == targetUrl) && chrome.tabs.create({
                    url: targetUrl,
                    pinned: true
                })
            })
        })
    })

    document.querySelector('#popup_splash_prevent_close_tab').applyy(_ => {
        _.innerHTML = Common.getI18nMsg("popup_splash_prevent_close_tab")
        _.setAttribute('data-tip', Common.getI18nMsg("popup_splash_prevent_close_tab_toolip"))
    })

    Common.getI18nMsg("features")
        .let(it => '<ul>' + it.split(',').map(element => '<li>' + element.trim() + '</li>').join('') + '</ul>')
        .let(it => Common.getI18nMsg("feature_head") + it + Common.getI18nMsg("features2", ['<br/>']))
        .let(it => {
            document.querySelector('#features').innerHTML = it
        })

})(window)