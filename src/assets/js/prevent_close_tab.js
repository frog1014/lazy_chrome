import {
    CREATE_PREVENT_CLOSE_TAB_MSG_TARGET,
    GO_TO_LAST_TAB_MSG_TARGET,
} from "./const"
import {
    TAB_ID_NONE
} from "./const_api"
import Api from "./api"

export default class PreventCloasTabHandler {
    static dispatch(res, windowsHistory) {
        switch (res.target) {
            case CREATE_PREVENT_CLOSE_TAB_MSG_TARGET:
                Api.isPreventClosePageCreated().then(async isPreventClosePageCreated => {
                    console.log(isPreventClosePageCreated)
                    var targetUrl = Api.getPreventCloseTabUrl();
                    !isPreventClosePageCreated && Api.getCurrentTab()
                        .then(currentTab => Api.createTab({
                            url: targetUrl,
                            openerTabId: currentTab.id,
                            pinned: true
                        }));
                });
                break;

            case GO_TO_LAST_TAB_MSG_TARGET:
                res.data.currentTab.let(currentTab =>
                    (windowsHistory.find(e => e.windowId == currentTab.windowId) || false).let(async found => {
                        let lastTabId = currentTab.openerTabId || TAB_ID_NONE;
                        if (found && (found.lastId != TAB_ID_NONE && found.lastId != currentTab.id && found.lastId != lastTabId)) {
                            lastTabId = found.lastId
                        }

                        if (lastTabId != TAB_ID_NONE && lastTabId != currentTab.id) {
                            try {
                                let tab = await Api.getTabById(lastTabId)
                                console.log('getTabById', tab)
                                tab && Api.activeTab(tab.id);
                            } catch (error) {
                                console.log('getTabById', error)
                                Api.findLastTabElseHandler();
                            }
                        } else {
                            Api.findLastTabElseHandler()
                        }
                    }));
                break;
            default:
                break;
        }
    }
}
