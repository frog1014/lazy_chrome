import {
    IS_PREVENT_CLOSE_TAB_TAG,
    COMMAND_MSG_TYPE,
    EXTENSIONS_URL,
    IS_OPEN_TAB_ON_NEXT_TAG,
    PREVENT_CLOSE_TAB_MSG_TYPE,
    CREATE_PREVENT_CLOSE_TAB_MSG_TARGET,
} from "../assets/js/const"
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

            e.target.checked &&
                await Api.chromeRuntimeSendMessage({
                    type: PREVENT_CLOSE_TAB_MSG_TYPE,
                    target: CREATE_PREVENT_CLOSE_TAB_MSG_TARGET
                })
        })
    })

    document.querySelector('#check-open-on-nex-tab').let(async it => {
        it.checked = await Api.getStorageData(IS_OPEN_TAB_ON_NEXT_TAG)

        it.addEventListener('change', async e => {
            await Api.setStorageData({
                [IS_OPEN_TAB_ON_NEXT_TAG]: e.target.checked
            })

            console.log('ok')
        })
    })

    // document.querySelector('#check-bookmark-title-simplifier').let(async it => {
    //     it.checked = await Api.getStorageData(IS_BOOKMARK_TITLE_SIMPLIFIER_TAG)

    //     it.addEventListener('change', async e => {
    //         await Api.setStorageData({
    //             [IS_BOOKMARK_TITLE_SIMPLIFIER_TAG]: e.target.checked
    //         })
    //         console.log('ok')
    //     })
    // })



    document.querySelector('#popup_splash_prevent_close_tab').applyy(_ => {
        _.innerHTML = Api.getI18nMsg("popup_splash_prevent_close_tab")
        _.setAttribute('data-tip', Api.getI18nMsg("popup_splash_prevent_close_tab_tooltip"))
    })

    document.querySelector('#popup_splash_open_on_nex_tab').applyy(_ => {
        _.innerHTML = Api.getI18nMsg("open_on_next_tab_for_search_or_paste")
    })

    // document.querySelector('#bookmark_title_simplifier_tooltip').applyy(_ => {
    //     _.innerHTML = Api.getI18nMsg("bookmark_title_simplifier")
    //     _.setAttribute('data-tip', Api.getI18nMsg("bookmark_title_simplifier_tooltip"))
    // })

    let res = await Api.chromeCommandsGetAll()
    console.log(res)
    res && res.length > 0 && res.filter(e => e.name != '_execute_action').let(it => {
        ('<ul>' + it.filter(element => (element.description.length + element.shortcut.length) > 0).map(element => '<li class="command-button" command="' + element.name + '">' + element.description + ': ' + element.shortcut + '</li>').join('') + '</ul>')
            .let(it => Api.getI18nMsg("feature_head") + it
                //  + Api.getI18nMsg("features2", ['<br/>'])
            )
            .let(it => {
                document.querySelector('#features').innerHTML = it
            })
    })

    document.querySelectorAll('li[command]').let(async res => {
        res.forEach(element => {
            let command = element.getAttribute('command')
            element.addEventListener('click', async e => {
                Api.chromeRuntimeSendMessage({
                    type: COMMAND_MSG_TYPE,
                    command
                })
            })
        });
    })
})(window)