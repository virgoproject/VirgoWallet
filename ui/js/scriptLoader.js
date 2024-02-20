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
    "../js/utils/currencyToSymbol.js",
    "../js/utils/stateful.js",
    "../../commonJS/qrcode.min.js",
    "../js/events.js",
    "../js/popup.js",
    "../js/panes/selectChains.js",
    "../js/panes/resume.js",
    "../js/panes/sendPane.js",
    "../js/panes/settings.js",
    "../js/panes/assetsPane.js",
    "../js/panes/swapPane.js",
    "../js/panes/tokenDetailPane.js",
    "../js/panes/contactsPane.js",
    "../js/panes/atomicSwapPane.js",
    "../js/panes/airdrops/airdrops.js",
    "../js/panes/airdrops/header.js",
    "../js/panes/airdrops/airdropCard.js",
    "../js/panes/airdrops/join.js",
    "../js/panes/createPane.js",
    "../js/web3/editFees.js",
    "../js/panes/tutorialPane.js",
    "../js/panes/unlockPane.js",
    "../js/panes/collectionNftPane.js",
    "../js/panes/nftDetailPane.js",
    "../js/panes/nftPane.js",
    "../js/panes/sendNft.js",
    "../js/panes/settings/connectedWebsites/connectedWebsite.js",
    "../js/panes/settings/connectedWebsites/connectedWebsites.js",
    "../js/panes/settings/menu.js",
    "../js/panes/settings/general/general.js",
    "../js/panes/settings/general/selectCurrency.js",
    "../js/panes/settings/networks/manage.js",
    "../js/panes/settings/networks/networkRow.js",
    "../js/panes/settings/networks/add.js",
    "../js/panes/settings/security/security.js",
    "../js/panes/settings/security/autolock.js",
    "../js/panes/settings/security/askPassword.js",
    "../js/panes/settings/security/backup.js",
    "../js/panes/settings/security/newPassword.js",
    "../js/panes/settings/security/import.js",
    "../js/components/sectionHeader.js",
    "../js/components/bottomPopup.js",
    "../js/panes/transactions/transactions.js",
    "../js/panes/transactions/transaction.js",
    "../js/panes/transactions/speedup.js",
    "../js/panes/transactions/cancel.js",
    "../js/panes/tokens/tokens.js",
    "../js/panes/tokens/token.js",
    "../js/panes/tokens/add.js",
    "../js/components/scrollView.js",
    "../js/components/searchBar.js"
]

const browserScripts = [
    "../../commonJS/browser-polyfill.js",
    "../../commonJS/utils.js"
]

const mobileScripts = [
    "../../commonJS/browser-polyfill-shim.js",
    "../../commonJS/reactMessaging.js",
    "../../commonJS/utils.js",
    "../../background/xhrShim.js",
    "../../background/utils/converter.js",
    "../../background/web3.min.js",
    "../../background/bip39.js",
    "../../background/hdwallet.js",
    "../../background/bundle.js",
    "../../background/swap/uniswap02Utils.js",
    "../../background/swap/uniswap03Utils.js",
    "../../background/swap/ethSwapUtils.js",
    "../../background/swap/atomicSwapUtils.js",
    "../../background/wallet/web3ABIs.js",
    "../../background/wallet/ethWallet.js",
    "../../background/wallet/baseWallet.js",
    "../../background/web3RequestsHandler.js",
    "../../background/utils/txIdentifierAbi.js",
    "../../background/background.js",
    "../js/utils/html5-qrcode.js",
    "../js/panes/qrScannerPane.js",
    "../../background/mobile/walletConnect/walletConnect.js",
    "../../background/messageHandlers/settings/connectedWebsites.js",
    "../../background/messageHandlers/settings/general.js",
    "../../background/messageHandlers/settings/networks.js",
    "../../background/messageHandlers/settings/security.js",
    "../../background/messageHandlers/airdrops.js",
    "../../background/messageHandlers/atomicSwap.js",
    "../../background/messageHandlers/contacts.js",
    "../../background/messageHandlers/misc.js",
    "../../background/messageHandlers/NFTs.js",
    "../../background/messageHandlers/swap.js",
    "../../background/messageHandlers/tokens.js",
    "../../background/messageHandlers/transactions.js",
    "../../background/messageHandlers/wallet.js",
    "../../background/messageHandlers/web3.js",
    "../js/panes/settings/security/biometrics.js",
]

const mobileScriptsAfter = [
    "../js/mobileTweaks.js",
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
    IS_MOBILE = false
    loadScripts(browserScripts).then(() => {
        loadScripts(commonScripts)
    })
} else {
    console.log("Script loader - mobile context")
    IS_MOBILE = true
    loadScripts(mobileScripts).then(() => {
        loadScripts(commonScripts).then(() => {
            loadScripts(mobileScriptsAfter)
        })
    })
}
