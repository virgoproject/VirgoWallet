const commonScripts = [
    "../../js/utils/jquery.min.js",
    "../../../commonJS/utils.js",
    "../../js/utils/backgroundMessaging.js",
    "../../js/web3/editFees.js",
    "../../js/utils/rangeSlider.js",
    "../../js/utils/jdenticon.min.js"
]

const browserScripts = [
    "../../../commonJS/browser-polyfill.js",
]

const mobileScripts = [
    "../../../commonJS/browser-polyfill-shim.js",
    "../../js/web3/mobileTweaks.js"
]

const loadScript = async src => {
    return new Promise(resolve => {
        const e = document.createElement("script")
        e.src = src
        e.async = false
        e.addEventListener("load", function () {
            resolve(true)
        })
        document.body.appendChild(e)
    })
}

const loadScripts = async list => {
    for(const script of list){
        await loadScript(script)
    }

    return true
}

const initScripts = (additionalScripts = []) => {
    if ((typeof chrome !== "undefined" && chrome.extension) || (typeof browser !== "undefined" && browser.extension) || (window.safari && safari.extension)) {
        console.log("Script loader - browser context")
        loadScripts(browserScripts).then(() => {
            loadScripts(commonScripts).then(() => {
                loadScripts(additionalScripts)
            })
        })
    } else {
        console.log("Script loader - mobile context")
        loadScripts(mobileScripts).then(() => {
            loadScripts(commonScripts).then(() => {
                loadScripts(additionalScripts)
            })
        })
    }
}