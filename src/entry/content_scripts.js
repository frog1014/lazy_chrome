import {
    COMMAND_KEY
} from "../assets/js/common"
(function () {
    console.log("content_script")
    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log('onMessage', msg);
        (msg && msg[COMMAND_KEY]).let(it => {
            switch (it) {
                case "nextPage":
                    nextP()
                    break;

                default:
                    break;
            }
        })
    })

    function nextP() {
        console.log('nextP');
        (document.querySelector('.c-pagination--next') || false).let(it => {
            console.log('querySelector',it)
            if (it) {
                it.click()
            }
        })
    }

})(window)