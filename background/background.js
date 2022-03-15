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

        case "estimateSendFees"://only support web3 R/N
            web3.eth.getGasPrice().then(function(gasPrice){
                //may have a problem with sending wrapped version of the main asset
                if(request.asset == baseWallet.getCurrentWallet().contract){
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
            //send native asset
            if(request.asset == baseWallet.getCurrentWallet().contract){
                web3.eth.estimateGas({from: baseWallet.getCurrentAddress(), to: request.recipient})
                    .then(function(gasLimit){
                        web3.eth.sendTransaction({from: baseWallet.getCurrentAddress(), to: request.recipient, value: request.amount, gas: gasLimit})
                            .on("transactionHash", function(hash){
                                sendResponse(hash)
                            })
                    })
                break
            }

            const contract = new web3.eth.Contract(ERC20_ABI, request.asset, { from: baseWallet.getCurrentAddress()});
            const transaction = contract.methods.transfer(request.recipient, request.amount);

            transaction.estimateGas().then(function(gasLimit){
                transaction.send({gas: gasLimit})
                    .on("transactionHash", function(hash){
                        sendResponse(hash)
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
            pendingAuthorizations.set(request.id, request.decision)
            break

        case "authorizeTransaction":
            pendingTransactions.set(request.id, request.decision)
            break

        case "authorizeSign":
            pendingSigns.set(request.id, request.decision)
            break

        case "closedBackupPopup":
            backupPopupDate = Date.now() + 604800000
            browser.storage.local.set({"backupPopupDate": backupPopupDate});
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
        "backupPopup": !baseWallet.isEncrypted() && backupPopupDate < Date.now()
    }
}

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
}

function handleWeb3Request(sendResponse, origin, method, params){
    console.log("method:" + method)
    switch(method){
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
            signTransaction(origin, params[0].from, params[0].to, params[0].value, params[0].data, params[0].gas, params[0].gasPrice).then(function(result){
                if(result)
                    web3.currentProvider.send({
                        jsonrpc: "2.0",
                        id: Date.now(),
                        method: method,
                        params: [{from: params[0].from, to: params[0].to, value: params[0].value, data: params[0].data, gas: params[0].gas, gasPrice: params[0].gasPrice}]
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
                        id: Date.now(),
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
                id: Date.now(),
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
    const wdw = window.open('/ui/html/authorize.html?id='+requestID+"&origin="+origin,'popup',`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=370, height=600, top=${top}, left=${left}`);

    setInterval(function() {
        if(wdw.closed) {
            clearInterval(this);
            if(pendingAuthorizations.get(requestID) == null)
                pendingAuthorizations.set(requestID, false)
        }
    }, 100);

    while(pendingAuthorizations.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingAuthorizations.get(requestID)
}

async function signTransaction(origin, from, to, value, data, gas, gasPrice){
    const requestID = Date.now() + "." + Math.random()

    if(value === undefined)
        value = 0x0

    value = web3.utils.fromWei(web3.utils.toBN(value))

    if(gasPrice === undefined)
        gasPrice = web3.utils.fromWei(await web3.eth.getGasPrice());
    else
        gasPrice = web3.utils.fromWei(web3.utils.toBN(gasPrice))

    const fees = gasPrice*gas

    pendingTransactions.set(requestID, null)
    const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;
    const wdw = window.open(`/ui/html/signTransaction.html?id=${requestID}&origin=${origin}&from=${from}&to=${to}&value=${value}&data=${data}&fees=${fees}&ticker=${baseWallet.getCurrentWallet().ticker}`,'popup',`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=370, height=600, top=${top}, left=${left}`);

    setInterval(function() {
        if(wdw.closed) {
            clearInterval(this);
            if(pendingTransactions.get(requestID) == null)
                pendingTransactions.set(requestID, false)
        }
    }, 100);

    while(pendingTransactions.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingTransactions.get(requestID)
}

async function signMessage(origin, data){
    const requestID = Date.now() + "." + Math.random()

    pendingSigns.set(requestID, null)
    const top = (screen.height - 600) / 4, left = (screen.width - 370) / 2;
    const wdw = window.open(`/ui/html/signMessage.html?id=${requestID}&origin=${origin}&data=${data}`,'popup',`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=370, height=600, top=${top}, left=${left}`);

    setInterval(function() {
        if(wdw.closed) {
            clearInterval(this);
            if(pendingSigns.get(requestID) == null)
                pendingSigns.set(requestID, false)
        }
    }, 100);

    while(pendingSigns.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingSigns.get(requestID)
}