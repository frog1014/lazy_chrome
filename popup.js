(function () {

    document.querySelector('#popup_splash_1').innerHTML = getI18nMsg("appDesc")
    var btnGoShortcutSetting = document.querySelector('#go_shortcut_setting')
    btnGoShortcutSetting.innerHTML = getI18nMsg("go_shortcut_setting")
    btnGoShortcutSetting.addEventListener('click', event => {
        chrome.tabs.create({
            url: EXTENSIONS_URL
        })
    })

    var checkPreventCloseTab = document.querySelector('#check-prevent-close-tab')
    getStorageData(IS_PREVENT_CLOSE_TAB_TAG, value => {
        console.log(IS_PREVENT_CLOSE_TAB_TAG, value)
        checkPreventCloseTab.checked = value
    })

    checkPreventCloseTab.addEventListener('change', e => {
        setStorageData({
            [IS_PREVENT_CLOSE_TAB_TAG]: e.target.checked
        }, () => {
            console.log('ok')
            e.target.checked && getTabs(tabs => {
                var targetUrl = getPreventCloseTabUrl()
                !tabs.find(tab => tab.url == targetUrl) && chrome.tabs.create({
                    url: targetUrl,
                    pinned: true
                })
            })
        })
    })

    document.querySelector('#popup_splash_prevent_close_tab').innerHTML = getI18nMsg("popup_splash_prevent_close_tab")
    document.querySelector('#popup_splash_prevent_close_tab').setAttribute('data-tip', getI18nMsg("popup_splash_prevent_close_tab_toolip"))
    document.querySelector('#features').innerHTML = getI18nMsg("features", ['<br/>'])
})(window)