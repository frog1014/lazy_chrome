(function () {

    document.querySelector('#popup_splash_1').innerHTML = getI18nMsg("appDesc")
    var btnGoShortcutSetting = document.querySelector('#go_shortcut_setting')
    btnGoShortcutSetting.innerHTML = getI18nMsg("go_shortcut_setting")
    btnGoShortcutSetting.addEventListener('click', event => {
        chrome.tabs.create({
            url: "chrome://extensions/shortcuts"
        })
    })

    var checkPreventCloseTab = document.querySelector('#check-prevent-close-tab')
    getStorageData(isPreventCloseTabTag, value => {
        console.log('isPreventCloseTabTag', value)
        checkPreventCloseTab.checked = value
    })

    checkPreventCloseTab.addEventListener('change', e => {
        setStorageData({
            [isPreventCloseTabTag]: e.target.checked
        }, () => {
            console.log('ok')
            e.target.checked && getTabs(tabs => {
                var targetUrl = getPreventCloseTabUrl()
                var findPreventCloseTab = tabs.find(tab => {
                    return tab.url == targetUrl
                });
                !findPreventCloseTab && chrome.tabs.create({
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