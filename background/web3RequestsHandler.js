function web3IsLogged(tabId, reqId){
    if(baseWallet === undefined){
        browser.windows.create({
            url: '/ui/html/web3/notLogged.html',
            type:'popup',
            height: 600,
            width: 370,
            top: 0,
            left: 0
        })
        respondToWeb3Request(tabId, reqId, {
            success: false,
            error: {
                message: "The user rejected the request.",
                code: 4001
            }
        })
        return false
    }
    return true
}

function askConnectToWebsite(origin, tabId, reqId){
    if(!web3IsLogged(tabId, reqId)) return

    const auth = {
        type: "connect",
        status: 0,
        reqId: reqId,
        tabId: tabId,
        origin: origin,
        expDate: Date.now() + 86400000
    }

    pendingAuthorizations[reqId] = auth
    browser.storage.local.set({"pendingAuthorizations": pendingAuthorizations})

    browser.windows.create({
        url: '/ui/html/web3/authorize.html?id='+reqId+"&origin="+origin,
        type:'popup',
        height: 600,
        width: 370,
        top: 0,
        left: 0
    })
}

async function signTransaction(origin, from, to, value, data, gas, method, tabId, reqId){
    if(!web3IsLogged(tabId, reqId)) return

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

    const auth = {
        type: "sendTx",
        status: 0,
        reqId: reqId,
        tabId: tabId,
        origin: origin,
        from: from,
        to: to,
        value: value,
        data: data,
        gas: gas,
        method: method,
        expDate: Date.now() + 86400000
    }

    pendingAuthorizations[reqId] = auth
    browser.storage.local.set({"pendingAuthorizations": pendingAuthorizations})

    console.log("req id: " + reqId)

    let dataTx = TxIdentifier.getDecodeAbi(data)
    console.log(auth,data)
    switch (dataTx.contractAddr){
        case "APPROVETOKEN":
            await browser.windows.create({
                url: `/ui/html/web3/approveToken.html?id=${reqId}&origin=${origin}&data=${data}&gas=${gas}&decimals=${baseWallet.getCurrentWallet().decimals}&ticker=${baseWallet.getCurrentWallet().ticker}&allowed=${to}&addr=${baseWallet.getCurrentAddress()}}`,
                type:'popup',
                height: 600,
                width: 370,
                top: 0,
                left: 0
            })
            break
        default:
            await browser.windows.create({
                url: `/ui/html/web3/signTransaction.html?id=${reqId}&origin=${origin}&from=${from}&to=${to}&value=${value}&data=${data}&gas=${gas}&decimals=${baseWallet.getCurrentWallet().decimals}&ticker=${baseWallet.getCurrentWallet().ticker}`,
                type:'popup',
                height: 600,
                width: 370,
                top: 0,
                left: 0
            })
    }

}

async function signMessage(origin, data, tabId, reqId, method){
    if(!web3IsLogged(tabId, reqId)) return

    const auth = {
        type: "signMessage",
        status: 0,
        reqId: reqId,
        tabId: tabId,
        origin: origin,
        data: data,
        expDate: Date.now() + 86400000,
        method: method
    }

    pendingAuthorizations[reqId] = auth
    browser.storage.local.set({"pendingAuthorizations": pendingAuthorizations})

    let msg = data[1]
    if(method == "eth_signTypedData_v4")
        msg = JSON.stringify(msg.message)

    msg = btoa(msg)

    browser.windows.create({
        url: `/ui/html/web3/signMessage.html?id=${reqId}&origin=${origin}&data=${msg}`,
        type:'popup',
        height: 600,
        width: 370,
        top: 0,
        left: 0
    })
}

function resolveWeb3Authorization(request){
    console.log("resolving req: " + request.id)
    const auth = pendingAuthorizations[request.id]
    if(auth === undefined || auth.status != 0) return false

    auth.status = 1

    if(request.decision)
        grantPendingAuthorization(auth, request.params)
    else
        refusePendingAuthorization(auth)
}

function respondToWeb3Request(tabId, reqId, response){
    browser.tabs.sendMessage(tabId, {command: "web3Response", id: reqId, resp: response})
}

function grantPendingAuthorization(auth, params){
    switch(auth.type){
        case "connect":
            if(!connectedWebsites.includes(auth.origin)){
                connectedWebsites.push(auth.origin)
                browser.storage.local.set({"connectedWebsites": connectedWebsites})
            }
            respondToWeb3Request(auth.tabId, auth.reqId, {
                success: true,
                data: [baseWallet.getCurrentAddress()]
            })
            break

        case "sendTx":
            console.log("confirming send")
            console.log(auth)
            web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function(nonce) {
                web3.currentProvider.send({
                    jsonrpc: "2.0",
                    id: Date.now() + "." + Math.random(),
                    method: auth.method,
                    params: [{
                        from: auth.from,
                        to: auth.to,
                        value: web3.utils.numberToHex(auth.value),
                        data: auth.data,
                        gas: web3.utils.numberToHex(auth.gas),
                        gasPrice: web3.utils.numberToHex(params.gasPrice),
                        nonce: nonce
                    }]
                }, async function (error, resp) {
                    if (!resp.error) {
                        respondToWeb3Request(auth.tabId, auth.reqId, {
                            success: true,
                            data: resp.result
                        })

                        if (auth.method === "eth_sendTransaction") {
                            console.log(auth)
                            let amount = auth.value
                            let data =  TxIdentifier.getDecodeAbi(auth.data, resp.result, Date.now(), auth.to, amount,params.gasPrice, auth.gas, nonce)
                            console.log(data)
                            baseWallet.getCurrentWallet().transactions.unshift(data)
                            baseWallet.save()
                        }
                        return
                    }
                    respondToWeb3Request(auth.tabId, auth.reqId, {
                        success: false,
                        error: {
                            message: error.message,
                            code: error.code
                        }
                    })
                })
            })
            break

        case "signMessage":
            console.log(auth)
            web3.currentProvider.send({
                jsonrpc: "2.0",
                id: Date.now() + "." + Math.random(),
                method: auth.method,
                params: auth.data
            }, function(error, resp){
                console.log(error)
                console.log(resp)
                if(!resp.error){
                    respondToWeb3Request(auth.tabId, auth.reqId, {
                        success: true,
                        data: resp.result
                    })
                    return
                }
                respondToWeb3Request(auth.tabId, auth.reqId, {
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code
                    }
                })
            })
            break
    }
}

function refusePendingAuthorization(auth){
    respondToWeb3Request(auth.tabId, auth.reqId, {
        success: false,
        error: {
            message: "The user rejected the request.",
            code: 4001
        }
    })
}

function isWebsiteAuthorized(origin, tabId, reqId){
    if(!connectedWebsites.includes(origin)){
        respondToWeb3Request(tabId, reqId, {
            success: false,
            error: {
                message: "The requested method and/or account has not been authorized by the user.",
                code: 4100
            }
        })
        return false
    }
    return true
}

function handleWeb3Request(sendResponse, origin, method, params, reqId, sender){
    const tabId = sender.tab.id

    console.log(method)
    console.log(params)

    switch(method){
        case "eth_chainId":
            web3.currentProvider.send({
                jsonrpc: "2.0",
                id: Date.now() + "." + Math.random(),
                method: method,
                params: params
            }, function(error, resp){
                if(!resp.error){
                    respondToWeb3Request(tabId, reqId, {
                        success: true,
                        data: resp.result
                    })
                    return
                }
                respondToWeb3Request(tabId, reqId, {
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code
                    }
                })
            })
            break
        case "eth_requestAccounts":
        case "eth_accounts":
            if(connectedWebsites.includes(origin)){
                respondToWeb3Request(tabId, reqId, {
                    success: true,
                    data: [baseWallet.getCurrentAddress()]
                })
                return
            }
            askConnectToWebsite(origin, tabId, reqId)
            break
        case "eth_signTransaction":
        case "eth_sendTransaction":
            if(!isWebsiteAuthorized(origin, tabId, reqId)) return

            signTransaction(origin, params[0].from, params[0].to, params[0].value, params[0].data, params[0].gas, method, tabId, reqId)
            break
        case "eth_sign":
            if(!isWebsiteAuthorized(origin, tabId, reqId)) return

            signMessage(origin, params, tabId, reqId, method)
            break
        case "eth_signTypedData_v4":
            if(!isWebsiteAuthorized(origin, tabId, reqId)) return

            signMessage(origin, [params[0], params[1]], tabId, reqId, method)
            break

        default:
            if(!isWebsiteAuthorized(origin, tabId, reqId)) return

            web3.currentProvider.send({
                jsonrpc: "2.0",
                id: Date.now() + "." + Math.random(),
                method: method,
                params: params
            }, function(error, resp){
                if(!resp.error){
                    respondToWeb3Request(tabId, reqId, {
                        success: true,
                        data: resp.result
                    })
                    return
                }
                respondToWeb3Request(tabId, reqId, {
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code
                    }
                })
            })
    }
}
