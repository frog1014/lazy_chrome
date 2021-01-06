import {
    COMMAND_KEY
} from "../assets/js/common"
import Api from "../assets/js/api"

(function () {
    console.log("content_script")
    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        console.log('onMessage', msg);
        (msg && msg[COMMAND_KEY]).let(it => {
            switch (it) {
                case "nextPage":
                    nextPage()
                    break;
                case "previousPage":
                    previousPage()
                    break;
                case "firstPage":
                    firstPage()
                    break;
                case "lastPage":
                    lastPage()
                    break;
                case "listPage":
                    listPage()
                    break;

                default:
                    break;
            }
        })
    })

    function nextPage() {
        console.log('nextPage');
        (document.querySelector('.c-pagination--next') || false).let(it => {
            console.log('querySelector', it)
            if (it) {
                it.click()
            } else {
                (document.querySelector('ul.l-pagination') || false).let(it => {
                    if (it) {
                        for (let key = 0; key < it.children.length; key++) {
                            if (it.children[key].classList.contains('is-active')) {
                                (it.children[key + 1] || false).let(it => {
                                    it && (it.querySelector('a') || false).let(it => it && it.click())
                                })
                                return
                            }
                        }
                    }
                })
            }
        })
    }

    function previousPage() {
        console.log('previousPage');
        (document.querySelector('.c-pagination--prev') || false).let(it => {
            console.log('querySelector', it)
            if (it) {
                it.click()
            } else {
                (document.querySelector('ul.l-pagination') || false).let(it => {
                    if (it) {
                        for (let key = 0; key < it.children.length; key++) {
                            if (it.children[key].classList.contains('is-active')) {
                                (it.children[key - 1] || false).let(it => {
                                    it && (it.querySelector('a') || false).let(it => it && it.click())
                                })
                                return
                            }
                        }
                    }
                })
            }
        })
    }

    function firstPage() {
        console.log('firstPage');
        (document.querySelector('.l-pagination a') || false).let(it => {
            console.log('querySelector', it)
            if (it) {
                it.click()
            }
        })
    }

    function lastPage() {
        console.log('lastPage');
        (document.querySelectorAll('.l-pagination a') || false).let(it => {
            console.log('querySelector', it)
            if (it) {
                it[it.length - 1].click()
            }
        })
    }

    function getReturnPage() {
        let ListReturnURL = undefined;
        if (window.sessionStorage) {
            ListReturnURL = window.sessionStorage.getItem('ListReturnURL');
        }

        console.log('ListReturnURL', ListReturnURL);
        return ListReturnURL || ((new URL(document.location)).searchParams.get('f') || false).let(it => 'topiclist.php?f=' + it)
    }

    function returnList() {
        window.location.href = getReturnPage();
    }

    function listPage() {
        (document.querySelector('.c-icon--oBack') || false).let(it => it && returnList())
    }

})(window)