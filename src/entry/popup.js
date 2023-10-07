import {
    IS_PREVENT_CLOSE_TAB_TAG,
    IS_BOOKMARK_TITLE_SIMPLIFIER_TAG,
    EXTENSIONS_URL,
} from "../assets/js/common"
import '../assets/css/popup.css'
import Api from "../assets/js/api"

(async function () {

    document.querySelector('#popup_splash_1').innerHTML = Api.getI18nMsg("appDesc")
    document.querySelector('#go_shortcut_setting').applyy(_ => {
        _.innerHTML = '<i class="fa fa-cog"></i> ' + Api.getI18nMsg("go_shortcut_setting")
        _.addEventListener('click', event => {
            Api.createTab({
                url: EXTENSIONS_URL
            })
        })
    })

    document.querySelector('#check-prevent-close-tab').let(async it => {
        it.checked = await Api.getStorageData(IS_PREVENT_CLOSE_TAB_TAG)

        it.addEventListener('change', async e => {
            await Api.setStorageData({
                [IS_PREVENT_CLOSE_TAB_TAG]: e.target.checked
            })

            console.log('ok')
            e.target.checked && (await Api.getTabs()).let(tabs => {
                var targetUrl = Api.getPreventCloseTabUrl();
                !tabs.find(tab => tab.url == targetUrl) && Api.createTab({
                    url: targetUrl,
                    pinned: true
                })
            })
        })
    })

    document.querySelector('#check-bookmark-title-simplifier').let(async it => {
        it.checked = await Api.getStorageData(IS_BOOKMARK_TITLE_SIMPLIFIER_TAG)

        it.addEventListener('change', async e => {
            await Api.setStorageData({
                [IS_BOOKMARK_TITLE_SIMPLIFIER_TAG]: e.target.checked
            })
            console.log('ok')
        })
    })

    document.querySelector('#popup_splash_prevent_close_tab').applyy(_ => {
        _.innerHTML = Api.getI18nMsg("popup_splash_prevent_close_tab")
        _.setAttribute('data-tip', Api.getI18nMsg("popup_splash_prevent_close_tab_tooltip"))
    })

    document.querySelector('#bookmark_title_simplifier_tooltip').applyy(_ => {
        _.innerHTML = Api.getI18nMsg("bookmark_title_simplifier")
        _.setAttribute('data-tip', Api.getI18nMsg("bookmark_title_simplifier_tooltip"))
    })

    let res = await Api.chromeCommandsGetAll()
    res && res.length > 0 && res.filter(e => e.name != '_execute_action').let(it => {
        ('<ul>' + it.filter(element => (element.description.length + element.shortcut.length) > 0).map(element => '<li>' + element.description + ': ' + element.shortcut + '</li>').join('') + '</ul>')
            .let(it => Api.getI18nMsg("feature_head") + it
                //  + Api.getI18nMsg("features2", ['<br/>'])
            )
            .let(it => {
                document.querySelector('#features').innerHTML = it
            })
    })
})(window)