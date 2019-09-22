import {
    IS_PREVENT_CLOSE_TAB_TAG,
    EXTENSIONS_URL,
} from "../assets/js/common"
import '../assets/css/popup.css'
import Api from "../assets/js/api"

(function () {

    document.querySelector('#popup_splash_1').innerHTML = Api.getI18nMsg("appDesc")
    document.querySelector('#go_shortcut_setting').applyy(_ => {
        _.innerHTML = '<i class="fa fa-cog"></i> ' + Api.getI18nMsg("go_shortcut_setting")
        _.addEventListener('click', event => {
            chrome.tabs.create({
                url: EXTENSIONS_URL
            })
        })
    })

    var checkPreventCloseTab = document.querySelector('#check-prevent-close-tab')
    Api.getStorageData(IS_PREVENT_CLOSE_TAB_TAG, value => {
        checkPreventCloseTab.checked = value
    })

    checkPreventCloseTab.addEventListener('change', e => {
        Api.setStorageData({
            [IS_PREVENT_CLOSE_TAB_TAG]: e.target.checked
        }, _ => {
            console.log('ok')
            e.target.checked && Api.getTabs(tabs => {
                var targetUrl = Api.getPreventCloseTabUrl();
                !tabs.find(tab => tab.url == targetUrl) && chrome.tabs.create({
                    url: targetUrl,
                    pinned: true
                })
            })
        })
    })

    document.querySelector('#popup_splash_prevent_close_tab').applyy(_ => {
        _.innerHTML = Api.getI18nMsg("popup_splash_prevent_close_tab")
        _.setAttribute('data-tip', Api.getI18nMsg("popup_splash_prevent_close_tab_toolip"))
    })

    Api.getI18nMsg("features")
        .let(it => '<ul>' + it.split(',').map(element => '<li>' + element.trim() + '</li>').join('') + '</ul>')
        .let(it => Api.getI18nMsg("feature_head") + it + Api.getI18nMsg("features2", ['<br/>']))
        .let(it => {
            document.querySelector('#features').innerHTML = it
        })

})(window)