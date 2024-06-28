//permit to JSON parse bigint to remove incompatibility with Web3.js 4.0
BigInt.prototype.toJSON = function() { return this.toString() }

const bgMessageHandlers = {}

function addBgMessageHandler(command, handler){
    bgMessageHandlers[command] = handler
}

if(typeof browser === 'undefined'){
    window = self
    importScripts("../commonJS/utils.js", "../commonJS/browser-polyfill.js", "xhrShim.js", "web3.min.js", "bip39.js", "hdwallet.js", "bundle.js",
        "utils/converter.js", "swap/uniswap02Utils.js", "swap/uniswap03Utils.js", "swap/ethSwapUtils.js", "swap/crossSwapUtils.js", "swap/atomicSwapUtils.js", "wallet/web3ABIs.js",
        "wallet/ethWallet.js", "wallet/baseWallet.js", "web3RequestsHandler.js","utils/txIdentifierAbi.js",
        "messageHandlers/reward.js", "messageHandlers/contacts.js", "messageHandlers/tokens.js", "messageHandlers/transactions.js",
        "messageHandlers/atomicSwap.js", "messageHandlers/misc.js", "messageHandlers/NFTs.js", "messageHandlers/swap.js", "messageHandlers/wallet.js",
        "messageHandlers/web3.js", "messageHandlers/settings/connectedWebsites.js", "messageHandlers/settings/general.js",
        "messageHandlers/settings/networks.js", "messageHandlers/settings/security.js")
}

if(browser.storage.session === undefined){
    browser.storage.session = {
        "get": async function(key){
            const data = window.sessionStorage.getItem(key)
            const res = {}
            res[key] = data
            return res
        },
        "set": async function(data){
            for(let [key, value] of Object.entries(data)){
                if(typeof value === "object")
                    value = JSON.stringify(value)

                window.sessionStorage.setItem(key, value)
            }
        }
    }
}

//Unlock SJCL AES CTR mode
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]()

const VERSION = "0.8.0"

const loadedElems = {}

let connectedWebsites = []

const notifsStored = []

let notifications = []

let notifCounter = 0;

browser.storage.local.get("connectedWebsites").then(function(res){
    if(res.connectedWebsites !== undefined)
        connectedWebsites = res.connectedWebsites

    loadedElems["connectedWebsites"] = true
})

browser.storage.local.get("notifications").then(function (res) {
    if(res.notifications !== undefined)
        notifications = res.notifications
    loadedElems["notifications"] = true
})

//fetchNotifs()

let selectedCurrency = "usd"

const pendingTransactions = {}
const pendingSigns = {}

let pendingAuthorizations = {}

let backupPopupDate = 0;

let accName = {}

let lockDelay = 60;
let autolockEnabled = true;

let biometricsEnabled = true;

let lastActivity = Date.now();

let setupDone = false;

let tutorialDone = false

BaseWallet.loadFromJSON().then(() => {
    browser.storage.local.get("connectedWebsites").then(function(res){
        if(res.connectedWebsites !== undefined)
            connectedWebsites = res.connectedWebsites

        loadedElems["connectedWebsites"] = true
    })

    browser.storage.local.get("selectedCurrency").then(function(res){
        if(res.selectedCurrency !== undefined)
            selectedCurrency = res.selectedCurrency

        loadedElems["selectedCurrency"] = true
    })

    browser.storage.local.get("pendingAuthorizations").then(function(res){
        if(res.pendingAuthorizations !== undefined)
            pendingAuthorizations = res.pendingAuthorizations

        loadedElems["pendingAuthorizations"] = true
    })

    browser.storage.local.get("backupPopupDate").then(function(res){
        if(res.backupPopupDate !== undefined)
            backupPopupDate = res.backupPopupDate

        loadedElems["backupDate"] = true
    })

    browser.storage.local.get("accountsNames").then(function (res){
        if (res.accountsNames === undefined || res.accountsNames.length === 0){
            let count = 0
            for (const address of baseWallet.getCurrentWallet().getAddressesJSON()){
                accName[address.address] = "Account "+count
                count++
            }
        }else{
            accName = res.accountsNames
        }

        loadedElems["accountsNames"] = true
    })

    browser.alarms.get('notifs').then(a => {
        if (!a) browser.alarms.create('notifs', { periodInMinutes: 1.0 })
      })

    browser.storage.local.get('setupDone').then(function (res) {
        if (res.setupDone !== undefined && res.setupDone !== null){
            setupDone = res.setupDone;
        }
        loadedElems["setupDone"] = true
    })

    browser.storage.local.get("autolockEnabled").then(function(res){
        if(res.autolockEnabled !== undefined && res.autolockEnabled !== null)
            autolockEnabled = res.autolockEnabled

        loadedElems["autolockEnabled"] = true
    })

    browser.storage.local.get("biometricsEnabled").then(function(res){
        if(res.biometricsEnabled !== undefined && res.biometricsEnabled !== null)
            biometricsEnabled = res.biometricsEnabled

        loadedElems["biometricsEnabled"] = true
    })

    browser.storage.local.get("lockDelay").then(function(res){
        if(res.lockDelay !== undefined && res.lockDelay !== null)
            lockDelay = res.lockDelay

        loadedElems["lockDelay"] = true
    })

    browser.storage.local.get("lastActivity").then(function(res){
        if(res.lastActivity !== undefined && res.lastActivity !== null)
            lastActivity = res.lastActivity

        loadedElems["lastActivity"] = true
    })

    browser.storage.local.get("tutorialDone").then(function(res){
        if(res.tutorialDone !== undefined && res.tutorialDone !== null)
            tutorialDone = res.tutorialDone

        loadedElems["tutorialDone"] = true
    })

    browser.storage.session.get("unlockPassword").then(function(res){
        if(res.unlockPassword !== undefined && res.unlockPassword !== null){
            unlockPassword = res.unlockPassword
            BaseWallet.loadFromJSON(unlockPassword).then(() => {
                loadedElems["unlockPassword"] = true
            })
        }else{
            loadedElems["unlockPassword"] = true
        }
    })

    browser.runtime.onInstalled.addListener(() => {
        browser.alarms.get('walletLock').then(a => {
            if (!a) browser.alarms.create('walletLock', { periodInMinutes: 1.0 })
        })
    })

    browser.alarms.onAlarm.addListener(async a => {
        while(Object.keys(loadedElems).length < 13){
            await new Promise(r => setTimeout(r, 10));
        }

        if(a.name == "walletLock"){
            if(baseWallet === undefined || !baseWallet.isEncrypted() || !autolockEnabled) return

            if(Date.now()-lastActivity >= lockDelay*60000){
                baseWallet = undefined
                browser.storage.session.set({"unlockPassword": null})
            }

        }else if(a.name === "notifs"){
          //fetchNotifs()
        }
    })

})

function activityHeartbeat(){
    lastActivity = Date.now()
    browser.storage.local.set({"lastActivity": lastActivity})
}

//only useful in mobile context
function checkAutolock(){
    if(baseWallet === undefined || !baseWallet.isEncrypted() || !autolockEnabled) return

    if(Date.now()-lastActivity >= lockDelay*60000){
        baseWallet = undefined
        browser.storage.session.set({"unlockPassword": null})
    }
}

//listen for messages sent by popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(sender.id != browser.runtime.id)
        return false

    onBackgroundMessage(request, sender, sendResponse)

    //must return true or for some reason message promise will fullfill before sendResponse being called
    return true
});

async function onBackgroundMessage(request, sender, sendResponse){
    while(Object.keys(loadedElems).length < 13){
        await new Promise(r => setTimeout(r, 10));
    }

    if(bgMessageHandlers[request.command] !== undefined){
        bgMessageHandlers[request.command](request, sender, sendResponse)
        return true
    }

    return true
}

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
}

function fetchNotifs() {
    fetch('https://airdrops.virgo.net:2096/api/notifications/retrieve',{
        method : 'GET',
        headers: {'Content-Type': 'application/json'}
    }).then(response => response.json())
        .then(results => {
            browser.storage.local.get('notifications').then(function(res) {
                const notifsIds = {}

                if (res.notifications === undefined) res.notifications = []

                for(const notif of res.notifications){
                    notifsIds[notif.id] = true
                }

                for(const notif of results){
                    if(!notifsIds[notif.id]){
                        res.notifications.push(notif)
                    }
                }
                countNotifs()
                browser.storage.local.set({"notifications": res.notifications})
            })
        })
}

function countNotifs(){
    browser.storage.local.get('notifications').then(function(res) {
        for (let i=0 ; i < res.notifications.length ; i++) {
            console.log(res.notifications[i].shown)
            if(res.notifications[i].shown === undefined){
                notifCounter = notifCounter+1
            }
            if(notifCounter === 0){
                browser.action.setBadgeText({text : ""})
            }else {
                browser.action.setBadgeText({text : notifCounter.toString()})
            }
        }
    })
}

function sendMessageToTabs(command, data){
    browser.tabs.query({}).then(function(tabs){
        for(let tab of tabs){
            browser.tabs.sendMessage(tab.id, {command: command, data: data})
        }
    })
}
