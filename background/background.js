window = self

importScripts("../commonJS/utils.js", "../commonJS/browser-polyfill.js", "xhrShim.js", "web3.min.js", "bip39.js", "hdwallet.js", "bundle.js",
    "utils/converter.js", "swap/uniswap02Utils.js",
    "swap/uniswap03Utils.js", "wallet/web3ABIs.js",
    "wallet/web3Wallet.js", "wallet/baseWallet.js")

//Unlock SJCL AES CTR mode
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]()

const VERSION = "0.7.6"

const loadedElems = {}

let connectedWebsites = []
browser.storage.local.get("connectedWebsites").then(function(res){
    if(res.connectedWebsites !== undefined)
        connectedWebsites = res.connectedWebsites

    loadedElems["connectedWebsites"] = true
})

const pendingAuthorizations = new Map()
const pendingTransactions = new Map()
const pendingSigns = new Map()

let backupPopupDate = 0;
browser.storage.local.get("backupPopupDate").then(function(res){
    if(res.backupPopupDate !== undefined)
        backupPopupDate = res.backupPopupDate

    loadedElems["backupDate"] = true
})

let accName = {}
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


let lockDelay = 60;
let autolockEnabled = false;
let lastActivity = Date.now();
let setupDone = false;

browser.storage.local.get('setupDone').then(function (res) {
    if (res.setupDone !== undefined){
        setupDone = res.setupDone;
    }
    loadedElems["setupDone"] = true
})

browser.storage.local.get("autolockEnabled").then(function(res){
    if(res.autolockEnabled !== undefined)
        autolockEnabled = res.autolockEnabled

    loadedElems["autolockEnabled"] = true
})

browser.storage.local.get("lockDelay").then(function(res){
    if(res.lockDelay !== undefined)
        lockDelay = res.lockDelay

    loadedElems["lockDelay"] = true
})

browser.storage.local.get("lastActivity").then(function(res){
    if(res.lastActivity !== undefined)
        lastActivity = res.lastActivity

    loadedElems["lastActivity"] = true
})

browser.storage.session.get("unlockPassword").then(function(res){
    if(res.unlockPassword !== undefined){
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
    while(Object.keys(loadedElems).length < 9){
        await new Promise(r => setTimeout(r, 10));
    }

    if(a.name == "walletLock"){
        if(baseWallet === undefined || !baseWallet.isEncrypted() || !autolockEnabled) return

        if(Date.now()-lastActivity >= lockDelay*60000){
            baseWallet = undefined
            browser.storage.session.set({"unlockPassword": null})
        }

    }
});

function activityHeartbeat(){
    lastActivity = Date.now()
    browser.storage.local.set({"lastActivity": lastActivity})
}

//listen for messages sent by popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    onBackgroundMessage(request, sender, sendResponse)

    //must return true or for some reason message promise will fullfill before sendResponse being called
    return true
});

async function onBackgroundMessage(request, sender, sendResponse){
    while(Object.keys(loadedElems).length < 9){
        await new Promise(r => setTimeout(r, 10));
    }

    switch (request.command) {
        case "getBaseInfos":
            if(baseWallet === undefined)
                sendResponse({"locked": true})
            else {
                sendResponse(getBaseInfos())
                activityHeartbeat()
            }
            break

        case "unlockWallet":
            activityHeartbeat()
            BaseWallet.loadFromJSON(request.password).then(function(res){
                if(res){
                    browser.storage.session.set({"unlockPassword": request.password})
                    sendResponse(getBaseInfos())
                }
                else sendResponse(false)
            })
            break

        case "changeWallet":
            baseWallet.selectWallet(request.walletId)
            sendResponse(true)
            sendMessageToTabs("chainChanged", baseWallet.getCurrentWallet().chainID)
            break

        case "validateAddress":
            sendResponse(web3.utils.isAddress(request.address))
            break

        case "addAccount":
            baseWallet.addAccount()
            sendResponse(getBaseInfos())
            break

        case "changeAccount":
            baseWallet.selectAddress(request.accountID)
            sendResponse(getBaseInfos())
            sendMessageToTabs("accountsChanged", [baseWallet.getCurrentAddress()])
            break

        case "changeAccountName":
            accName[request.address] = request.newName
            browser.storage.local.set({"accountsNames": accName});
            return false

        case "getGasPrice":
            web3.eth.getGasPrice().then(function(gasPrice){
                sendResponse(gasPrice)
            })
            break

        case "estimateSendFees"://only support web3 R/N
            web3.eth.getGasPrice().then(function(gasPrice){
                //may have a problem with sending wrapped version of the main asset
                if(request.asset == baseWallet.getCurrentWallet().ticker){
                    //sending chain's native asset
                    web3.eth.estimateGas({from: baseWallet.getCurrentAddress(), to: request.recipient})
                        .then(function(gasLimit){
                            sendResponse({gasPrice: gasPrice, gasLimit: gasLimit, decimals: baseWallet.getCurrentWallet().decimals})
                        })
                    return
                }

                const contract = new web3.eth.Contract(ERC20_ABI, request.asset, { from: baseWallet.getCurrentAddress()});

                contract.methods.transfer(request.recipient, request.amount).estimateGas()
                    .then(function(gasLimit){
                        sendResponse({gasPrice: gasPrice, gasLimit: gasLimit, decimals: baseWallet.getCurrentWallet().decimals})
                    })
            })
            break

        case "getBalance":
            getBalance(request.asset).then(bal => {
                sendResponse(bal)
            })
            break

        //temporary solution, will need to go full-crosschain
        case "getBalanceCross":
            if(request.chainID == baseWallet.getCurrentWallet().chainID){
                getBalance(request.asset).then(bal => {
                    sendResponse(bal)
                })
            }else{
                const chain = baseWallet.getChainByID(request.chainID)
                const tempWeb3 = new Web3(chain.rpcURL)

                let assetBal = chain.getBalances(baseWallet.getCurrentAddress())[request.asset]
                if(request.asset == chain.ticker){
                    tempWeb3.eth.getBalance(baseWallet.getCurrentAddress()).then(bal => {
                        assetBal.balance = bal
                        sendResponse(assetBal)
                    })
                }else{
                    const contract = new tempWeb3.eth.Contract(ERC20_ABI, request.asset)
                    contract.methods.balanceOf(baseWallet.getCurrentAddress()).call().then(bal => {
                        assetBal.balance = bal
                        sendResponse(assetBal)
                    })
                }
            }
            break



        case "sendTo":
            sendTo(request, sendResponse)
            break

        case "getTokenDetails":
            const tokenContract = new web3.eth.Contract(ERC20_ABI, request.asset, { from: baseWallet.getCurrentAddress()});
            tokenContract.methods.name().call().then(function(name){
                tokenContract.methods.decimals().call().then(function(decimals){
                    tokenContract.methods.symbol().call().then(function(symbol){
                        sendResponse({
                            contract: request.asset,
                            name: name,
                            decimals: decimals,
                            symbol: symbol
                        })
                    }).catch(function(){
                        sendResponse(false)
                    })
                }).catch(function(){
                    sendResponse(false)
                })
            }).catch(function(){
                sendResponse(false)
            })
            break

        case "addToken":
            baseWallet.getCurrentWallet().addToken(request.name, request.ticker, request.decimals, request.contract)
            sendResponse(true)
            break

        case "hasAsset":
            sendResponse(baseWallet.getCurrentWallet().tokenSet.has(request.address) ||  baseWallet.getCurrentWallet().tokenSet.has(request.address.toLowerCase()))
            break

        case "getMnemonic"://protect with a password later
            sendResponse(baseWallet.mnemonic)
            break

        case "setPassword":
            if(baseWallet.isEncrypted() && !baseWallet.passwordMatch(request.oldPassword)){
                sendResponse(false)
                break
            }

            baseWallet.encrypt(request.password)
            baseWallet.save()

            sendResponse(true)
            break

        case "passwordMatch":
            sendResponse(baseWallet.passwordMatch(request.password))
            break

        case "restoreFromMnemonic":
            try {
                const startLoop = baseWallet === undefined
                baseWallet = BaseWallet.generateWallet(request.mnemonic)
                baseWallet.save()

                accName = {}
                browser.storage.local.set({"accountsNames": accName})

                if(startLoop) baseWallet.startLoop()
                else {
                    baseWallet.getCurrentWallet().update()
                    baseWallet.getCurrentWallet().updatePrices()
                }
                browser.storage.local.set({"setupDone": true})
                setupDone = true
                sendResponse(getBaseInfos())
            }catch(e){
                console.log(e)
                sendResponse(false)
            }
            break

        case "isMnemonicValid":
            try {
                BaseWallet.generateWallet(request.mnemonic)
                sendResponse(true)
            }catch(e){
                console.log(e)
                sendResponse(false)
            }
            break

        case "web3Request":
            handleWeb3Request(sendResponse, request.origin, request.method, request.params)
            break

        case "authorizeWebsiteConnection":
            if(pendingAuthorizations.get(request.id) == null)
                pendingAuthorizations.set(request.id, request.decision)
            return false


        case "authorizeTransaction":
            if(pendingTransactions.get(request.id) == null)
                pendingTransactions.set(request.id, request.decision)
            return false

        case "authorizeSign":
            if(pendingSigns.get(request.id) == null)
                pendingSigns.set(request.id, request.decision)
            return false

        case "closedBackupPopup":
            backupPopupDate = Date.now() + 604800000
            browser.storage.local.set({"backupPopupDate": backupPopupDate});
            return false

        case "changeTokenTracking":
            baseWallet.getCurrentWallet().changeTracking(request.contract)
            sendResponse(true)
            break

        case "getSpeedupGasPrice":
            web3.eth.getTransaction(request.hash).then(transaction => {
                web3.eth.getGasPrice().then(res => {
                    if(parseInt(transaction.gasPrice) > parseInt(res))
                        sendResponse(parseInt(transaction.gasPrice)*1.1)
                    else
                        sendResponse(parseInt(res)*1.1)
                })
            })
            break

        case "speedUpTransaction":
            web3.eth.getTransaction(request.hash).then(transaction => {
                web3.eth.sendTransaction({
                    from: transaction.from,
                    to: transaction.to,
                    value: transaction.value,
                    gas: transaction.gas,
                    gasPrice: request.gasPrice,
                    data: transaction.input,
                    nonce: transaction.nonce
                }).on('transactionHash', function(hash){
                    const changedTx = baseWallet.getCurrentWallet().getTransaction(request.hash)
                    changedTx.hash = hash
                    changedTx.gasPrice = request.gasPrice
                    baseWallet.save()
                    sendResponse(hash)
                })
            })
            break

        case "getCancelGasPrice":
            web3.eth.getTransaction(request.hash).then(transaction => {
                if(transaction == null)
                    sendResponse(0)
                else {
                    web3.eth.getGasPrice().then(res => {
                        if(parseInt(transaction.gasPrice) > parseInt(res)){
                            sendResponse(parseInt(transaction.gasPrice)*1.1)
                        }else{
                            sendResponse(parseInt(res)*1.1)
                        }
                    })
                }
            })
            break

        case "cancelTransaction":
            web3.eth.getTransaction(request.hash).then(transaction => {
                if (transaction == null) {
                    const changedTx = baseWallet.getCurrentWallet().getTransaction(request.hash)
                    changedTx.status = false
                    changedTx.gasUsed = 0
                    changedTx.gasPrice = 0
                    baseWallet.save()
                    sendResponse(true)
                }else{
                    web3.eth.sendTransaction({
                        from: transaction.from,
                        to: transaction.from,
                        value: 0,
                        gas: 21000,
                        gasPrice: request.gasPrice,
                        nonce: transaction.nonce
                    }).on("transactionHash", function(hash){
                        const changedTx = baseWallet.getCurrentWallet().getTransaction(request.hash)
                        changedTx.canceling = true
                        changedTx.cancelingPrice = request.gasPrice
                        baseWallet.save()
                        sendResponse(true)
                    })
                }
            })
            break

        case "closedUpdatePopup":
            baseWallet.version = VERSION
            baseWallet.save()
            return false

        case "getAutolock":
            sendResponse({
                enabled: autolockEnabled,
                delay: lockDelay
            })
            break

        case "setAutolock":
            autolockEnabled = request.enabled
            lockDelay = request.delay
            browser.storage.local.set({"autolockEnabled": autolockEnabled})
            browser.storage.local.set({"lockDelay": lockDelay})
            return false

        case "addContact":
            browser.storage.local.get('contactList').then(function(res){

                const newContact = {
                    name : request.name,
                    address : request.address,
                    note : request.note,
                    favorite : request.favorite
                }


                if(res.contactList === undefined) {
                    browser.storage.local.set({"contactList": [newContact]})
                    sendResponse(true)
                } else {

                    const result = res.contactList.filter(record =>
                        record.address === request.address)

                    if (result.length <= 0){
                        res.contactList.push(newContact)
                        browser.storage.local.set({"contactList": res.contactList})
                        sendResponse(true)
                    } else {
                        sendResponse("already")
                    }

                }
            })
            break

        case "deleteContact":
            browser.storage.local.get('contactList').then(function(res) {

                for (var i=0 ; i < res.contactList.length ; i++)
                {
                    if (res.contactList[i].address === request.address) {
                        res.contactList.splice(i, 1)
                        browser.storage.local.set({"contactList": res.contactList})
                        sendResponse(true)
                        break
                    }
                }

            })
            break

        case "deleteFavorite":
            browser.storage.local.get('contactList').then(function(res) {
                for (var i=0 ; i < res.contactList.length ; i++) {
                    if (res.contactList[i].address === request.address) {

                        if (res.contactList[i].favorite !== false) {
                            res.contactList[i].favorite = false
                        } else {
                            res.contactList[i].favorite = true
                        }
                    }

                }
                browser.storage.local.set({"contactList": res.contactList})
            })
            return false

        case "updateContact":
            browser.storage.local.get('contactList').then(function(res) {

                let nameSetter = ''
                let noteSetter = ''

                if (request.name === '')
                    nameSetter = res.contactList[request.contactIndex].name
                else
                    nameSetter = request.name


                if (request.note === ''){
                    noteSetter = res.contactList[request.contactIndex].note
                } else {
                    noteSetter = request.note

                }

                const updateContact = {
                    name : nameSetter,
                    address : res.contactList[request.contactIndex].address,
                    note : noteSetter,
                    favorite : res.contactList[request.contactIndex].favorite
                }

                res.contactList.splice(request.contactIndex, 1)
                res.contactList.splice(request.contactIndex, 0,updateContact)
                browser.storage.local.set({"contactList": res.contactList})

            })
            return false

        case "getContacts":
            browser.storage.local.get('contactList').then(function(res) {
                if(res.contactList !== undefined){
                    sendResponse(res.contactList)
                }else {
                    sendResponse(false)
                }

            })
            break

        case "getSwapRoute":
            let decimals = baseWallet.getCurrentWallet().tokenSet.get(request.token1)

            if(decimals === undefined)
                decimals = baseWallet.getCurrentWallet().decimals
            else
                decimals = decimals.decimals

            if(request.token1 == baseWallet.getCurrentWallet().ticker)
                request.token1 = baseWallet.getCurrentWallet().contract
            else if(request.token2 == baseWallet.getCurrentWallet().ticker)
                request.token2 = baseWallet.getCurrentWallet().contract

            baseWallet.getCurrentWallet().getSwapRoute(
                web3.utils.toBN(Utils.toAtomicString(request.amount, decimals)),
                request.token1,
                request.token2
            ).then(function(resp){
                resp.amount = resp.amount.toString()
                sendResponse(resp)
            })
            break

        case "estimateSwapFees":
            let decimals2 = baseWallet.getCurrentWallet().tokenSet.get(request.route[0])

            if(decimals2 === undefined)
                decimals2 = baseWallet.getCurrentWallet().decimals
            else
                decimals2 = decimals2.decimals

            baseWallet.getCurrentWallet().estimateSwapFees(
                web3.utils.toBN(Utils.toAtomicString(request.amount, decimals2)),
                request.route
            ).then(function(resp){
                sendResponse(resp)
            })
            break

        case "initSwap":
            let decimals3 = baseWallet.getCurrentWallet().tokenSet.get(request.route[0])

            if(decimals3 === undefined)
                decimals3 = baseWallet.getCurrentWallet().decimals
            else
                decimals3 = decimals3.decimals

            baseWallet.getCurrentWallet().initSwap(
                web3.utils.toBN(Utils.toAtomicString(request.amount, decimals3)),
                request.route,
                request.gasPrice
            ).then(function(resp){
                baseWallet.getCurrentWallet().changeTracking(request.route[request.route.length-1], true)
                sendResponse(true)
            })
            break
        case "removeToken":
            baseWallet.getCurrentWallet().removeToken(request.address)
            break
            
        case 'tickerFromChainID':
            sendResponse(baseWallet.getChainByID(request.id))
            break

        case 'checkAirdropPlay':
            browser.storage.local.get('airdropinfos').then(function(res){
                let addressUser = request.address
                let airdropID = request.id
                console.log(res)
                if(res === undefined){
                    sendResponse(false)
                    return
                }

                const result = res.airdropinfos.filter(record => record.address == addressUser && record.airdropid == airdropID)
                if (result.length <= 0){
                    sendResponse(true)
                } else {
                    sendResponse(false)
                }
            })
            break
        case 'setAirdropPlay' :
            browser.storage.local.get('airdropinfos').then(function(res){
                let addressUser = request.address
                let airdropID = request.id
                const newAirdrop = {
                    airdropid : airdropID,
                    address : addressUser
                }

                console.log(newAirdrop)

                console.log(res.airdropinfos)

                if(res.airdropinfos === undefined) {
                    browser.storage.local.set({"airdropinfos": [newAirdrop]})
                    sendResponse(true)
                } else {
                    const result = res.airdropinfos.filter(record => record.address === addressUser.address && record.id === airdropID.airdropid)
                    console.log(result)
                    if (result.length <= 0){
                        res.airdropinfos.push(newAirdrop)
                        browser.storage.local.set({"airdropinfos": res.airdropinfos})
                        sendResponse(true)
                    } else {
                        sendResponse(false)
                    }

                }
            })
            break
        case "resetAirdrops":
            browser.storage.local.set({"airdropinfos": []})
            break
            
        case 'deleteConnectedSite':
            for (var i=0 ; i < connectedWebsites.length ; i++)
            {
                if (connectedWebsites[i] === request.address) {
                    connectedWebsites.splice(i, 1)
                    sendResponse({'accepted': true,'siteLength' : connectedWebsites.length})
                    break
                }
            }
            sendResponse(true)
            break

        case 'setupDone':
            browser.storage.local.set({"setupDone": true})
            setupDone = true
            sendResponse(setupDone)
            break

        case "setupNot":
            browser.storage.local.set({"setupDone": false})
            setupDone = false
            break
    }
}

function getBaseInfos(){
    if (baseWallet.version != VERSION){
        browser.storage.local.set({"setupDone": true})
        setupDone = true
    }

    return {
        "wallets": baseWallet.getWalletsJSON(),
        "selectedWallet": baseWallet.selectedWallet,
        "addresses": baseWallet.getCurrentWallet().getAddressesJSON(),
        "selectedAddress": baseWallet.selectedAddress,
        "encrypted": baseWallet.isEncrypted(),
        "backupPopup": !baseWallet.isEncrypted() && backupPopupDate < Date.now(),
        "updatePopup":  baseWallet.version != VERSION,
        "connectedSites": connectedWebsites,
        "setupDone" : setupDone
    }
}

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
}

async function getBalance(asset){
    const bal = baseWallet.getCurrentWallet().getBalances(baseWallet.getCurrentAddress())[asset]

    if(!bal.tracked){
        const contract = new web3.eth.Contract(ERC20_ABI, asset)
        bal.balance = await contract.methods.balanceOf(baseWallet.getCurrentAddress()).call()
    }

    return bal
}

function sendTo(request, sendResponse){
    let txResume = null;
    //send native asset
    web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function(nonce){
        if (request.asset == baseWallet.getCurrentWallet().ticker) {

            request.amount = web3.utils.toBN(Utils.toAtomicString(request.amount, baseWallet.getCurrentWallet().decimals))

            web3.eth.sendTransaction({
                from: baseWallet.getCurrentAddress(),
                to: request.recipient,
                value: request.amount,
                gas: request.gasLimit,
                gasPrice: request.gasPrice,
                nonce: nonce
            })
                .on("transactionHash", function (hash) {
                    txResume = {
                        "hash": hash,
                        "contractAddr": baseWallet.getCurrentWallet().ticker,
                        "date": Date.now(),
                        "recipient": request.recipient,
                        "amount": request.amount.toString(),
                        "gasPrice": request.gasPrice,
                        "gasLimit": request.gasLimit,
                        "nonce": nonce
                    }
                    console.log("Got hash: " + hash)
                    baseWallet.getCurrentWallet().transactions.unshift(txResume)
                    sendResponse(hash)
                    baseWallet.save()

                    //resend if not propagated after 60s
                    setTimeout(function (){
                        web3.eth.getTransaction(hash)
                            .then(function(res){
                                if(res == null) {
                                    console.log("transaction not propagated after 60s, resending")
                                    web3.eth.sendTransaction({
                                        from: baseWallet.getCurrentAddress(),
                                        to: request.recipient,
                                        value: request.amount,
                                        gas: request.gasLimit,
                                        gasPrice: request.gasPrice,
                                        nonce: nonce
                                    })
                                }
                            })
                    }, 60000)
                })
                .on("confirmation", function(confirmationNumber, receipt, lastestBlockHash){
                    if(txResume.status === undefined){
                        if(receipt.status){
                            browser.notifications.create("txNotification", {
                                "type": "basic",
                                "title": "Transaction confirmed!",
                                "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                "message": "Transaction " + txResume.hash + " confirmed"
                            });
                        }else if(receipt.status == false){
                            browser.notifications.create("txNotification", {
                                "type": "basic",
                                "title": "Transaction failed.",
                                "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                "message": "Transaction " + txResume.hash + " failed"
                            });
                        }
                    }
                    txResume.gasUsed = receipt.gasUsed
                    txResume.status = receipt.status
                    txResume.confirmations = confirmationNumber
                    baseWallet.save()
                }).catch(e => {
                    if(e.code == -32000){
                        baseWallet.selectWallet(baseWallet.selectedWallet)
                        sendTo(request, sendResponse)
                    }
                })
            return
        }

        let decimals = baseWallet.getCurrentWallet().tokenSet.get(request.asset)

        if(decimals === undefined)
            decimals = baseWallet.getCurrentWallet().decimals
        else
            decimals = decimals.decimals

        request.amount = web3.utils.toBN(Utils.toAtomicString(request.amount, decimals))

        const contract = new web3.eth.Contract(ERC20_ABI, request.asset, {from: baseWallet.getCurrentAddress()});
        const transaction = contract.methods.transfer(request.recipient, request.amount);

        transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})
            .on("transactionHash", function (hash) {
                console.log("got hash: " + hash)
                txResume = {
                    "hash": hash,
                    "contractAddr": request.asset,
                    "date": Date.now(),
                    "recipient": request.recipient,
                    "amount": request.amount.toString(),
                    "gasPrice": request.gasPrice,
                    "gasLimit": request.gasLimit,
                    "nonce": nonce
                }
                baseWallet.getCurrentWallet().transactions.unshift(txResume)
                sendResponse(hash)
                baseWallet.save()

                setTimeout(function (){
                    web3.eth.getTransaction(hash)
                        .then(function(res){
                            if(res == null) {
                                console.log("transaction not propagated after 60s, resending")
                                transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})

                                //still not propagated, reset web3 and resend
                                setTimeout(function(){
                                    web3.eth.getTransaction(hash)
                                        .then(function(res) {
                                            if (res == null) {
                                                web3 = new Web3(provider)
                                                console.log("still not propagated, reset web3 and resend")
                                                transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})
                                            }
                                        })
                                }, 60000)
                            }
                        })
                }, 60000)
            })
            .on("confirmation", function(confirmationNumber, receipt){
                if(txResume.status === undefined){
                    if(receipt.status){
                        browser.notifications.create("txNotification", {
                            "type": "basic",
                            "title": "Transaction confirmed!",
                            "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                            "message": "Transaction " + txResume.hash + " confirmed"
                        });
                    }else if(receipt.status == false){
                        browser.notifications.create("txNotification", {
                            "type": "basic",
                            "title": "Transaction failed.",
                            "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                            "message": "Transaction " + txResume.hash + " failed"
                        });
                    }
                }
                txResume.gasUsed = receipt.gasUsed
                txResume.status = receipt.status
                txResume.confirmations = confirmationNumber
                baseWallet.save()
            }).catch(e => {
                if(e.code == -32000){
                    baseWallet.selectWallet(baseWallet.selectedWallet)
                    sendTo(request, sendResponse)
                }
            })
    })
}

function handleWeb3Request(sendResponse, origin, method, params){
    switch(method){
        case "eth_chainId":
            web3.currentProvider.send({
                jsonrpc: "2.0",
                id: Date.now() + "." + Math.random(),
                method: method,
                params: params
            }, function(error, resp){
                if(!resp.error){
                    sendResponse({
                        success: true,
                        data: resp.result
                    })
                    return
                }
                sendResponse({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code
                    }
                })
            })
            return
        case "eth_requestAccounts":
            if(connectedWebsites.includes(origin)){
                sendResponse({
                    success: true,
                    data: [baseWallet.getCurrentAddress()]
                })
                return
            }
            askConnectToWebsite(origin).then(function(result){
                if(result){
                    connectedWebsites.push(origin)
                    browser.storage.local.set({"connectedWebsites": connectedWebsites})
                    sendResponse({
                        success: true,
                        data: [baseWallet.getCurrentAddress()]
                    })
                }
                else
                    sendResponse({
                        success: false,
                        error: {
                            message: "The user rejected the request.",
                            code: 4001
                        }
                    })
            })
            break
        case "eth_accounts":
            if(!connectedWebsites.includes(origin)){
                sendResponse({
                    success: false,
                    error: {
                        message: "The requested method and/or account has not been authorized by the user.",
                        code: 4100
                    }
                })
                return
            }
            sendResponse({
                success: true,
                data: [baseWallet.getCurrentAddress()]
            })
            break
        case "eth_signTransaction":
        case "eth_sendTransaction":
            if(!connectedWebsites.includes(origin)){
                sendResponse({
                    success: false,
                    error: {
                        message: "The requested method and/or account has not been authorized by the user.",
                        code: 4100
                    }
                })
                return
            }
            signTransaction(origin, params[0].from, params[0].to, params[0].value, params[0].data, params[0].gas).then(function(result){
                if(result !== false)
                    web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function(nonce) {
                        console.log(nonce)
                        web3.currentProvider.send({
                            jsonrpc: "2.0",
                            id: Date.now() + "." + Math.random(),
                            method: method,
                            params: [{
                                from: params[0].from,
                                to: params[0].to,
                                value: params[0].value,
                                data: params[0].data,
                                gas: params[0].gas,
                                gasPrice: web3.utils.numberToHex(result),
                                nonce: nonce
                            }]
                        }, function (error, resp) {
                            if (!resp.error) {
                                sendResponse({
                                    success: true,
                                    data: resp.result
                                })

                                if (method == "eth_sendTransaction") {
                                    baseWallet.getCurrentWallet().transactions.unshift({
                                        "hash": resp.result,
                                        "contractAddr": "WEB3_CALL",
                                        "date": Date.now(),
                                        "recipient": params[0].to,
                                        "amount": params[0].value,
                                        "gasPrice": web3.utils.hexToNumber(result),
                                        "gasLimit": web3.utils.hexToNumber(params[0].gas),
                                        "nonce": nonce
                                    })
                                    baseWallet.save()
                                }
                                return
                            }
                            sendResponse({
                                success: false,
                                error: {
                                    message: error.message,
                                    code: error.code
                                }
                            })
                        })
                    })
                else
                    sendResponse({
                        success: false,
                        error: {
                            message: "The user rejected the request.",
                            code: 4001
                        }
                    })
            })
            break
        case "eth_sign":
            if(!connectedWebsites.includes(origin)){
                sendResponse({
                    success: false,
                    error: {
                        message: "The requested method and/or account has not been authorized by the user.",
                        code: 4100
                    }
                })
                return
            }
            signMessage(origin, params[1]).then(function(result){
                if(result)
                    web3.currentProvider.send({
                        jsonrpc: "2.0",
                        id: Date.now() + "." + Math.random(),
                        method: method,
                        params: params
                    }, function(error, resp){
                        if(!resp.error){
                            sendResponse({
                                success: true,
                                data: resp.result
                            })
                            return
                        }
                        sendResponse({
                            success: false,
                            error: {
                                message: error.message,
                                code: error.code
                            }
                        })
                    })
                else
                    sendResponse({
                        success: false,
                        error: {
                            message: "The user rejected the request.",
                            code: 4001
                        }
                    })
            })
            break
        default:
            if(!connectedWebsites.includes(origin)){
                sendResponse({
                    success: false,
                    error: {
                        message: "The requested method and/or account has not been authorized by the user.",
                        code: 4100
                    }
                })
                return
            }
            web3.currentProvider.send({
                jsonrpc: "2.0",
                id: Date.now() + "." + Math.random(),
                method: method,
                params: params
            }, function(error, resp){
                if(!resp.error){
                    sendResponse({
                        success: true,
                        data: resp.result
                    })
                    return
                }
                sendResponse({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code
                    }
                })
            })
    }
}

function sendMessageToTabs(command, data){
    browser.tabs.query({}).then(function(tabs){
        for(let tab of tabs){
            browser.tabs.sendMessage(tab.id, {command: command, data: data})
        }
    })
}

async function askConnectToWebsite(origin){

    if(baseWallet === undefined){
        browser.windows.create({
            url: '/ui/html/notLogged.html',
            type:'popup',
            height: 600,
            width: 370,
            top: 0,
            left: 0
        })
        return false
    }

    const requestID = Date.now() + "." + Math.random()

    pendingAuthorizations.set(requestID, null)

    await browser.windows.create({
        url: '/ui/html/authorize.html?id='+requestID+"&origin="+origin,
        type:'popup',
        height: 600,
        width: 370,
        top: 0,
        left: 0
    })

    while(pendingAuthorizations.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingAuthorizations.get(requestID)
}

async function signTransaction(origin, from, to, value, data, gas){
    if(baseWallet === undefined){
        browser.windows.create({
            url: '/ui/html/notLogged.html',
            type:'popup',
            height: 600,
            width: 370,
            top: 0,
            left: 0
        })
        return false
    }

    const requestID = Date.now() + "." + Math.random()

    if(gas === undefined)
        gas = await web3.eth.estimateGas({
            from: from,
            to: to,
            value: value,
            data: data
        })

    if(value === undefined)
        value = 0x0

    if(web3.utils.isHexStrict(value))
        value = web3.utils.hexToNumberString(value)

    if(web3.utils.isHexStrict(gas))
        gas = web3.utils.hexToNumberString(gas)

    pendingTransactions.set(requestID, null)

    await browser.windows.create({
        url: `/ui/html/signTransaction.html?id=${requestID}&origin=${origin}&from=${from}&to=${to}&value=${value}&data=${data}&gas=${gas}&decimals=${baseWallet.getCurrentWallet().decimals}&ticker=${baseWallet.getCurrentWallet().ticker}`,
        type:'popup',
        height: 600,
        width: 370,
        top: 0,
        left: 0
    })

    while(pendingTransactions.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(pendingTransactions.get(requestID))

    return pendingTransactions.get(requestID)
}

async function signMessage(origin, data){
    if(baseWallet === undefined){
        browser.windows.create({
            url: '/ui/html/notLogged.html',
            type:'popup',
            height: 600,
            width: 370,
            top: 0,
            left: 0
        })
        return false
    }

    const requestID = Date.now() + "." + Math.random()

    pendingSigns.set(requestID, null)

    await browser.windows.create({
        url: `/ui/html/signMessage.html?id=${requestID}&origin=${origin}&data=${data}`,
        type:'popup',
        height: 600,
        width: 370,
        top: 0,
        left: 0
    })

    while(pendingSigns.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingSigns.get(requestID)
}
