import {
    IS_PREVENT_CLOSE_TAB_TAG,
    IS_BOOKMARK_TITLE_SIMPLIFIER_TAG,
    EXTENSIONS_URL,
} from "../assets/js/common"
import manifest from '../manifest.json'
import '../assets/css/popup.css'
import Api from "../assets/js/api"

(function () {
    document.querySelector('#popup_splash_1').innerHTML = Api.getI18nMsg("appDesc")
    document.querySelector('.splash-head').innerHTML = manifest.name
    document.querySelector('#go_shortcut_setting').applyy(_ => {
        _.innerHTML = '<i class="fa fa-cog"></i> ' + Api.getI18nMsg("go_shortcut_setting", [manifest.name])
        _.addEventListener('click', event => {
            chrome.tabs.create({
                url: EXTENSIONS_URL
            })
        })
    })

    chrome.commands.getAll(function (res) {
        console.log('getAll', res)
        res && res.length > 0 && res.let(it => {
            ('<ul>' + it.map(element => '<li>' + element.description + ': ' + element.shortcut + '</li>').join('') + '</ul>')
            .let(it => Api.getI18nMsg("feature_head") + it
                    //  + Api.getI18nMsg("features2", ['<br/>'])
                )
                .let(it => {
                    document.querySelector('#features').innerHTML = it
                })
        });
    })

})(window)