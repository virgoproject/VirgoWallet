//Unlock SJCL AES CTR mode
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]()

const connectedWebsites = [];

const pendingAuthorizations = new Map();
const pendingTransactions = new Map();
const pendingSigns = new Map();

let backupPopupDate = 0;
browser.storage.local.get("backupPopupDate").then(function(res){
    if(res.backupPopupDate !== undefined)
        backupPopupDate = res.backupPopupDate
})

//listen for messages sent by popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
        case "getBaseInfos":
            if(baseWallet === undefined)
                sendResponse({"locked": true})
            else
                sendResponse(getBaseInfos())
            break;

        case "unlockWallet":
            BaseWallet.loadFromJSON(request.password).then(function(res){
                if(res)
                    sendResponse(getBaseInfos())
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
                    web3.eth.estimateGas({from: baseWallet.getCurrentAddress(), to: request.recipient, gasPrice: gasPrice})
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
            sendResponse(baseWallet.getCurrentWallet().getBalances(baseWallet.getCurrentAddress())[request.asset])
            break

        case "sendTo":
            let txResume = null;
            //send native asset
            web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function(nonce){
                if (request.asset == baseWallet.getCurrentWallet().ticker) {

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
                                "amount": request.amount,
                                "gasPrice": request.gasPrice,
                                "gasLimit": request.gasLimit,
                                "nonce": nonce
                            }
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

                                            //still not propagated, reset web3 and resend
                                            setTimeout(function(){
                                                web3.eth.getTransaction(hash)
                                                    .then(function(res) {
                                                        if (res == null) {
                                                            web3 = new Web3(provider)
                                                            console.log("still not propagated, reset web3 and resend")
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
                                        }
                                    })
                            }, 60000)
                        })
                        .on("confirmation", function(confirmationNumber, receipt, lastestBlockHash){
                            txResume.gasUsed = receipt.gasUsed
                            txResume.status = receipt.status
                            txResume.confirmations = confirmationNumber
                            baseWallet.save()
                        })
                    return
                }

                const contract = new web3.eth.Contract(ERC20_ABI, request.asset, {from: baseWallet.getCurrentAddress()});
                const transaction = contract.methods.transfer(request.recipient, request.amount);

                transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})
                    .on("transactionHash", function (hash) {
                        txResume = {
                            "hash": hash,
                            "contractAddr": request.asset,
                            "date": Date.now(),
                            "recipient": request.recipient,
                            "amount": request.amount,
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
                        txResume.gasUsed = receipt.gasUsed
                        txResume.status = receipt.status
                        txResume.confirmations = confirmationNumber
                        baseWallet.save()
                    })
            })
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
                if(startLoop) baseWallet.startLoop()
                else {
                    baseWallet.getCurrentWallet().update()
                    baseWallet.getCurrentWallet().updatePrices()
                }
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
            break

        case "authorizeTransaction":
            if(pendingTransactions.get(request.id) == null)
                pendingTransactions.set(request.id, request.decision)
            break

        case "authorizeSign":
            if(pendingSigns.get(request.id) == null)
                pendingSigns.set(request.id, request.decision)
            break

        case "closedBackupPopup":
            backupPopupDate = Date.now() + 604800000
            browser.storage.local.set({"backupPopupDate": backupPopupDate});
            break

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
    }
    //must return true or for some reason message promise will fullfill before sendResponse being called
    return true
});

function getBaseInfos(){
    return {
        "wallets": baseWallet.getWalletsJSON(),
        "selectedWallet": baseWallet.selectedWallet,
        "addresses": baseWallet.getCurrentWallet().getAddressesJSON(),
        "selectedAddress": baseWallet.selectedAddress,
        "encrypted": baseWallet.isEncrypted(),
        "backupPopup": !baseWallet.isEncrypted() && backupPopupDate < Date.now(),
        "connectedSites": connectedWebsites
    }
}

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
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
    const requestID = Date.now() + "." + Math.random()

    pendingAuthorizations.set(requestID, null)
    const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;

    await browser.windows.create({
        url: '/ui/html/authorize.html?id='+requestID+"&origin="+origin,
        type:'popup',
        height: 600,
        width: 370,
        top: top,
        left: left
    })

    while(pendingAuthorizations.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingAuthorizations.get(requestID)
}

async function signTransaction(origin, from, to, value, data, gas){
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

    console.log("beeee " + gas)

    pendingTransactions.set(requestID, null)
    const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;

    await browser.windows.create({
        url: `/ui/html/signTransaction.html?id=${requestID}&origin=${origin}&from=${from}&to=${to}&value=${value}&data=${data}&gas=${gas}&decimals=${baseWallet.getCurrentWallet().decimals}&ticker=${baseWallet.getCurrentWallet().ticker}`,
        type:'popup',
        height: 600,
        width: 370,
        top: top,
        left: left
    })

    while(pendingTransactions.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(pendingTransactions.get(requestID))

    return pendingTransactions.get(requestID)
}

async function signMessage(origin, data){
    const requestID = Date.now() + "." + Math.random()

    pendingSigns.set(requestID, null)
    const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;

    await browser.windows.create({
        url: `/ui/html/signMessage.html?id=${requestID}&origin=${origin}&data=${data}`,
        type:'popup',
        height: 600,
        width: 370,
        top: top,
        left: left
    })

    while(pendingSigns.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingSigns.get(requestID)
}