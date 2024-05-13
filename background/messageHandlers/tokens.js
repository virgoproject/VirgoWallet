class TokensHandlers {

    static register(){
        addBgMessageHandler("estimateSendFees", this.estimateSendFees)
        addBgMessageHandler("getBalance", this.getBalance)
        addBgMessageHandler("getBalanceCross", this.getBalanceCross)
        addBgMessageHandler("sendTo", this.sendTo)
        addBgMessageHandler("getTokenDetails", this.getTokenDetails)
        addBgMessageHandler("getTokenDetailsCross", this.getTokenDetailsCross)
        addBgMessageHandler("addToken", this.addToken)
        addBgMessageHandler("hasAsset", this.hasAsset)
        addBgMessageHandler("removeToken", this.removeToken)
        addBgMessageHandler("changeTokenTracking", this.changeTokenTracking)
        addBgMessageHandler("getAllTokens", this.getAllTokens)
    }

    static estimateSendFees(request, sender, sendResponse){
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
    }

    static getBalance(request, sender, sendResponse){
        TokensHandlers._getBalance(request.asset).then(bal => {
            sendResponse(bal)
        })
    }

    static async _getBalance(asset){
        if(asset == "") asset = baseWallet.getCurrentWallet().ticker

        const bal = baseWallet.getCurrentWallet().getBalances(baseWallet.getCurrentAddress())[asset]

        if(!bal.tracked){
            const contract = new web3.eth.Contract(ERC20_ABI, asset)
            bal.balance = await contract.methods.balanceOf(baseWallet.getCurrentAddress()).call()
        }

        return bal
    }

    static getBalanceCross(request, sender, sendResponse){
        if(request.chainID == baseWallet.getCurrentWallet().chainID){
            TokensHandlers._getBalance(request.asset).then(bal => {
                sendResponse(bal)
            })
        }else{
            const chain = baseWallet.getChainByID(request.chainID)
            const tempWeb3 = new Web3(chain.rpcURL)

            if(request.asset == "") request.asset = chain.ticker

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
    }

    static sendTo(request, sender, sendResponse){
        TokensHandlers._sendTo(request, sendResponse)
    }

    static async _sendTo(request, sendResponse){
        let txResume = null;

        //send native asset
        web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function(nonce){
            if (request.asset == baseWallet.getCurrentWallet().ticker) {

                request.amount = new BN(Utils.toAtomicString(request.amount, baseWallet.getCurrentWallet().decimals))

                web3.eth.sendTransaction({
                    from: baseWallet.getCurrentAddress(),
                    to: request.recipient,
                    value: request.amount.toString(),
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
                        TokensHandlers._sendTo(request, sendResponse)
                    }
                })
                return
            }

            let decimals = baseWallet.getCurrentWallet().tokenSet.get(request.asset)

            if(decimals === undefined)
                decimals = baseWallet.getCurrentWallet().decimals
            else
                decimals = decimals.decimals

            request.amount = new BN(Utils.toAtomicString(request.amount, decimals))

            const contract = new web3.eth.Contract(ERC20_ABI, request.asset, {from: baseWallet.getCurrentAddress()});
            const transaction = contract.methods.transfer(request.recipient, request.amount.toString());

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
                    TokensHandlers._sendTo(request, sendResponse)
                }
            })
        })
    }

    static getTokenDetailsCross(request, sender, sendResponse){
        const wallet = baseWallet.getChainByID(request.chainID)

        if(wallet.ticker == request.contract){
            sendResponse({
                contract: request.contract,
                name: wallet.asset,
                decimals: wallet.decimals,
                ticker: wallet.ticker
            })
            return
        }

        if(wallet.hasToken(request.contract)){
            sendResponse(wallet.getToken(request.contract))
            return
        }

        const web3_cross = baseWallet.getWeb3ByID(request.chainID)

        const tokenContract = new web3_cross.eth.Contract(ERC20_ABI, request.contract, { from: baseWallet.getCurrentAddress()});

        tokenContract.methods.name().call().then(function(name){
            tokenContract.methods.decimals().call().then(function(decimals){
                tokenContract.methods.symbol().call().then(function(symbol){
                    sendResponse({
                        contract: request.contract,
                        name: name,
                        decimals: decimals,
                        ticker: symbol
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
    }

    static getTokenDetails(request, sender, sendResponse){
        if(request.asset === undefined){
            sendResponse(false)
            return
        }

        if(baseWallet.getCurrentWallet().hasToken(request.asset)){
            sendResponse(baseWallet.getCurrentWallet().tokenSet.get(request.asset))
            return
        }

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
    }

    static addToken(request, sender, sendResponse){
        baseWallet.getCurrentWallet().addToken(request.name, request.symbol, request.decimals, request.contract)
        sendResponse(true)
    }

    static hasAsset(request, sender, sendResponse){
        sendResponse(baseWallet.getCurrentWallet().tokenSet.has(request.address) ||  baseWallet.getCurrentWallet().tokenSet.has(request.address.toLowerCase()))
    }

    static removeToken(request, sender, sendResponse){
        baseWallet.getCurrentWallet().removeToken(request.address)
    }

    static changeTokenTracking(request, sender, sendResponse){
        baseWallet.getCurrentWallet().changeTracking(request.contract)
        sendResponse(true)
    }

    static getAllTokens(request, sender, sendResponse){
        const tokens = []

        for (let i = baseWallet.wallets.length - 1; i >= 0; i--) {
            const wallet = baseWallet.wallets[i]
            for(const token of wallet.tokens){
                const t = structuredClone(token)
                t.chainID = wallet.chainID
                t.chainName = wallet.name
                tokens.unshift(t)
            }
            tokens.unshift({
                contract: wallet.ticker,
                name: wallet.asset,
                ticker: wallet.ticker,
                decimals: wallet.decimals,
                chainID: wallet.chainID,
                chainName: wallet.name
            })
        }

        sendResponse(tokens)
    }

}

TokensHandlers.register()
