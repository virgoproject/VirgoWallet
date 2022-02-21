//Unlock SJCL AES CTR mode
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]()

const pendingAuthorizations = new Map();

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
                            .then(function(receipt){
                                sendResponse(receipt)
                            })
                    })
                break
            }

            const contract = new web3.eth.Contract(ERC20_ABI, request.asset, { from: baseWallet.getCurrentAddress()});
            const transaction = contract.methods.transfer(request.recipient, request.amount);

            transaction.estimateGas().then(function(gasLimit){
                transaction.send({gas: gasLimit})
                    .then(function(receipt){
                        sendResponse(receipt)
                    })
            })
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
                baseWallet = BaseWallet.generateWallet(request.mnemonic)
                baseWallet.save()
                sendResponse(getBaseInfos())
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
        "encrypted": baseWallet.isEncrypted()
    }
}

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
}

function handleWeb3Request(sendResponse, origin, method, params){
    switch(method){
        case "eth_requestAccounts":
            askConnectToWebsite(origin).then(function(result){
                if(result)
                    sendResponse({
                        success: true,
                        data: [baseWallet.getCurrentAddress()]
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
        case "eth_accounts":
            sendResponse({
                success: true,
                data: [baseWallet.getCurrentAddress()]
            })
            break
        default:
            console.log(method)
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
    window.open('chrome-extension://fjfjnimgccnlloinkpkgelbonpjolinn/ui/html/authorize.html?id='+requestID+"&origin="+origin,'popup',`toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=370, height=600, top=${top}, left=${left}`);

    while(pendingAuthorizations.get(requestID) == null){
        await new Promise(r => setTimeout(r, 50));
    }

    return pendingAuthorizations.get(requestID)
}