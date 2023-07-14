const commonScripts = [
    "../js/utils/jquery.min.js",
    "../js/utils/bn.js",
    "../js/utils/bootstrap.bundle.min.js",
    "../js/utils/progressRing.js",
    "../js/utils/notyf.min.js",
    "../js/utils/jdenticon.min.js",
    "../js/utils/tinysort.min.js",
    "../js/utils/rangeSlider.js",
    "../js/utils/chart.min.js",
    "../js/utils/bootstrap-select.min.js",
    "../js/utils/backgroundMessaging.js",
    "../js/utils/tokensSelect.js",
    "../js/utils/getDominantColor.js",
    "../js/events.js",
    "../js/popup.js",
    "../js/panes/selectChains.js",
    "../js/panes/resume.js",
    "../js/panes/sendPane.js",
    "../js/panes/settings.js",
    "../js/panes/assetsPane.js",
    "../js/panes/swapPane.js",
    "../js/panes/transactionsPane.js",
    "../js/panes/tokenDetailPane.js",
    "../js/panes/contactsPane.js",
    "../js/panes/atomicSwapPane.js",
    "../js/panes/airdropPane.js",
    "../js/panes/createPane.js",
    "../js/web3/editFees.js",
    "../js/panes/tutorialPane.js",
    "../js/panes/unlockPane.js",
    "../js/panes/settings/connectedWebsites.js",
    "../js/panes/settings/changeCurrency.js",
    "../js/panes/settings/importMnemonic.js",
    "../js/panes/settings/passwordSetup.js",
    "../js/panes/settings/showMnemonic.js"
]

const browserScripts = [
    "../../commonJS/browser-polyfill.js",
    "../../commonJS/utils.js"
]

const mobileScripts = [
    "../../commonJS/browser-polyfill-shim.js",
    "../../commonJS/utils.js",
    "../../background/xhrShim.js",
    "../../background/utils/converter.js",
    "../../background/web3.min.js",
    "../../background/bip39.js",
    "../../background/hdwallet.js",
    "../../background/bundle.js",
    "../../background/swap/uniswap02Utils.js",
    "../../background/swap/uniswap03Utils.js",
    "../../background/swap/atomicSwapUtils.js",
    "../../background/wallet/web3ABIs.js",
    "../../background/wallet/ethWallet.js",
    "../../background/wallet/baseWallet.js",
    "../../background/web3RequestsHandler.js",
    "../../background/utils/txIdentifierAbi.js",
    "../../background/background.js",
    "../js/mobileTweaks.js",
    "../js/utils/html5-qrcode.js",
    "../js/panes/qrScannerPane.js",
    "../../background/mobile/walletConnect/walletConnectWeb3Wallet.js",
    "../../background/mobile/walletConnect/walletConnectCore.js",
    "../../background/mobile/walletConnect/walletConnect.js"
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

if ((typeof chrome !== "undefined" && chrome.extension) || (typeof browser !== "undefined" && browser.extension) || (window.safari && safari.extension)) {
    console.log("Script loader - browser context")
    loadScripts(browserScripts).then(() => {
        loadScripts(commonScripts)
    })
} else {
    console.log("Script loader - mobile context")
    loadScripts(mobileScripts).then(() => {
        loadScripts(commonScripts)
    })
}
