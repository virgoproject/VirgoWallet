const commonScripts = [
    "../js/utils/jquery.min.js",
    "../js/utils/bn.js",
    "../js/utils/bootstrap.bundle.min.js",
    "../js/utils/progressRing.js",
    "../js/utils/notyf.min.js",
    "../js/utils/jdenticon.min.js",
    "../js/utils/chart.min.js",
    "../js/utils/backgroundMessaging.js",
    "../js/utils/currencyToSymbol.js",
    "../js/utils/stateful.js",
    "../js/locales/en.js",
    "../js/locales/fr.js",
    "../js/locales/es.js",
    "../js/locales/ar.js",
    "../js/locales/zh.js",
    "../js/locales/de.js",
    "../js/locales/id.js",
    "../js/locales/it.js",
    "../js/locales/ja.js",
    "../js/locales/ko.js",
    "../js/locales/pt.js",
    "../js/locales/ru.js",
    "../js/locales/tr.js",
    "../js/locales/uk.js",
    "../js/locales/vi.js",
    "../../commonJS/qrcode.min.js",
    "../js/popup.js",
    "../js/panes/loading.js",
    "../js/panes/unlock.js",
    "../js/panes/setup.js",
    "../js/web3/editFees.js",
    "../js/panes/settings/connectedWebsites/connectedWebsite.js",
    "../js/panes/settings/connectedWebsites/connectedWebsites.js",
    "../js/panes/settings/menu.js",
    "../js/panes/settings/general/general.js",
    "../js/panes/settings/general/selectCurrency.js",
    "../js/panes/settings/general/selectLanguage.js",
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
    "../js/components/searchBar.js",
    "../js/panes/tokenDetails/tokenDetails.js",
    "../js/panes/tokenDetails/simple.js",
    "../js/panes/tokenDetails/full/full.js",
    "../js/panes/tokenDetails/full/chart.js",
    "../js/panes/tokenDetails/full/statistics.js",
    "../js/panes/tokenDetails/full/news.js",
    "../js/panes/home/home.js",
    "../js/panes/home/header.js",
    "../js/panes/home/chainSelector.js",
    "../js/panes/home/mainBalance.js",
    "../js/panes/home/banners.js",
    "../js/panes/home/assets/assets.js",
    "../js/panes/home/assets/tokens/tokens.js",
    "../js/panes/home/assets/tokens/token.js",
    "../js/panes/home/assets/nfts/nfts.js",
    "../js/panes/contacts/contacts.js",
    "../js/panes/contacts/add.js",
    "../js/panes/contacts/details.js",
    "../js/panes/send/send.js",
    "../js/panes/send/amount.js",
    "../js/panes/send/confirm.js",
    "../js/panes/selectToken.js",
    "../js/panes/editFees.js",
    "../js/panes/receive.js",
    "../js/panes/swap/swap.js",
    "../js/panes/swap/confirm.js",
    "../js/panes/swap/selectToken.js",
    "../js/panes/swap/transak/confirm.js",
    "../js/panes/swap/transak/confirmed.js",
    "../js/panes/home/accounts/accounts.js",
    "../js/panes/home/accounts/addAccount.js",
    "../js/panes/home/accounts/editAccount.js",
    "../js/panes/reward/reward.js",
    "../js/panes/reward/rules.js",
    "../js/panes/reward/airdrops/airdrops.js",
    "../js/panes/reward/airdrops/header.js",
    "../js/panes/reward/airdrops/airdropCard.js",
    "../js/panes/reward/airdrops/join.js",
    "../js/panes/reward/quests/quests.js",
    "../js/panes/reward/quests/dailyReward.js",
    "../js/panes/reward/quests/swaps.js",
    "../js/panes/reward/referral/referral.js",
    "../js/panes/reward/startTimer.js",
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
    "../../background/swap/crossSwapUtils.js",
    "../../background/swap/ethSwapUtils.js",
    "../../background/swap/atomicSwapUtils.js",
    "../../background/wallet/web3ABIs.js",
    "../../background/wallet/eth/updater.js",
    "../../background/wallet/eth/wallet.js",
    "../../background/wallet/baseWallet.js",
    "../../background/web3RequestsHandler.js",
    "../../background/utils/txIdentifierAbi.js",
    "../../background/background.js",
    "../js/utils/html5-qrcode.js",
    "../../background/mobile/walletConnect/walletConnect.js",
    "../../background/messageHandlers/settings/connectedWebsites.js",
    "../../background/messageHandlers/settings/general.js",
    "../../background/messageHandlers/settings/networks.js",
    "../../background/messageHandlers/settings/security.js",
    "../../background/messageHandlers/reward.js",
    "../../background/messageHandlers/atomicSwap.js",
    "../../background/messageHandlers/contacts.js",
    "../../background/messageHandlers/misc.js",
    "../../background/messageHandlers/NFTs.js",
    "../../background/messageHandlers/swap.js",
    "../../background/messageHandlers/tokens.js",
    "../../background/messageHandlers/transactions.js",
    "../../background/messageHandlers/wallet.js",
    "../../background/messageHandlers/web3.js",
]

const mobileScriptsAfter = [
    "../js/mobileTweaks.js",
    "../js/panes/settings/security/biometrics.js",
    "../js/panes/QRScanner/QRScanner.js",
    "../js/panes/QRScanner/request.js"
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
