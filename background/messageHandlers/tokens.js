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
        addBgMessageHandler("getTokens", this.getTokens)
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

                request.amount = Utils.toAtomicString(request.amount, baseWallet.getCurrentWallet().decimals)

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

            request.amount = Utils.toAtomicString(request.amount, decimals)

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


    /**
     * Get token Details
     */
    static tokenDetailsCache = new Map();

    static async _fetchTokenDetails(chainID, contractAddress) {
        const cacheKey = `${chainID}-${contractAddress}`;
        if (this.tokenDetailsCache.has(cacheKey)) {
            return this.tokenDetailsCache.get(cacheKey);
        }

        const wallet = baseWallet.getChainByID(chainID)

        //check if token is chain's native asset
        if (wallet.ticker === contractAddress) {
            return {
                contract: contractAddress,
                name: wallet.asset,
                decimals: wallet.decimals,
                ticker: wallet.ticker,
            };
        }

        //check if that's a know token
        if (wallet.hasToken(contractAddress)) {
            return wallet.getToken(contractAddress);
        }

        //if not found, fetch with web3
        try {
            const web3Instance = baseWallet.getWeb3ByID(chainID)

            const tokenContract = new web3Instance.eth.Contract(ERC20_ABI, contractAddress);

            const [name, decimals, symbol] = await Promise.all([
                tokenContract.methods.name().call(),
                tokenContract.methods.decimals().call(),
                tokenContract.methods.symbol().call(),
            ]);

            const tokenDetails = {
                contract: contractAddress,
                name,
                decimals,
                ticker: symbol,
            };

            this.tokenDetailsCache.set(cacheKey, tokenDetails);
            return tokenDetails;
        } catch (error) {
            console.error(`Error fetching token details for ${contractAddress} on chain ${chainID}:`, error);
            return false;
        }
    }

    static async getTokenDetails(request, sender, sendResponse) {
        if (!request.asset) {
            sendResponse(false);
            return;
        }

        const chainID = baseWallet.getCurrentWallet().chainID;

        console.log("getTokenDetails")
        console.log(request.asset)
        console.log(chainID)
        console.log("")

        const tokenDetails = await TokensHandlers._fetchTokenDetails(chainID, request.asset);

        sendResponse(tokenDetails || false);
    }

    static async getTokenDetailsCross(request, sender, sendResponse) {
        const { chainID, contract } = request;

        console.log("cross")
        console.log(chainID, contract)
        console.log("")

        if (!chainID || !contract) {
            sendResponse(false);
            return;
        }

        const tokenDetails = await TokensHandlers._fetchTokenDetails(chainID, contract);

        sendResponse(tokenDetails || false);
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
            const balances = wallet.getBalances(wallet.getCurrentAddress())
            for(const tokenAddr in balances){
                const token = balances[tokenAddr]
                const t = structuredClone(token)
                t.chainID = wallet.chainID
                t.chainName = wallet.name
                t.contract = tokenAddr
                tokens.unshift(t)
            }
        }

        sendResponse(tokens)
    }

    static getTokens(request, sender, sendResponse){
        const tokens = []

        const wallet = baseWallet.getCurrentWallet()
        const balances = wallet.getBalances(wallet.getCurrentAddress())

        for(const tokenAddr in balances){
            const token = balances[tokenAddr]
            const t = structuredClone(token)
            t.chainID = wallet.chainID
            t.chainName = wallet.name
            t.contract = tokenAddr
            tokens.unshift(t)
        }

        sendResponse(tokens)
    }

}

TokensHandlers.register()
