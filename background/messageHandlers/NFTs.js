class NFTsHandlers {

    static register(){
        addBgMessageHandler("estimateSendFeesNft", this.estimateSendFees)
        addBgMessageHandler("sendToNft", this.sendTo)
        addBgMessageHandler("getNftDetails", this.getNFTDetails)
        addBgMessageHandler("addNft", this.addNFT)
        addBgMessageHandler("removeNft", this.removeNFT)
    }

    static estimateSendFees(request, sender, sendResponse){
        web3.eth.getGasPrice().then(function(gasPrice){

            const contract = new web3.eth.Contract(ERC721_ABI, request.address);

            contract.methods.safeTransferFrom(baseWallet.getCurrentAddress(), request.recipient, request.tokenId).estimateGas().then(function(gasLimit){
                sendResponse({gasPrice: gasPrice, gasLimit: gasLimit, decimals: baseWallet.getCurrentWallet().decimals})
            })
        })
    }

    static sendTo(request, sender, sendResponse){
        NFTsHandlers._sendTo(request, sendResponse)
    }

    static async _sendTo(request, sendResponse){
        const _this = this

        let txResume = null

        web3.eth.getTransactionCount(baseWallet.getCurrentAddress(), "pending").then(function (nonce){
            const contractNft = new web3.eth.Contract(ERC721_ABI, request.contractNft, {from: baseWallet.getCurrentAddress()} )
            const transaction = contractNft.methods.safeTransferFrom(baseWallet.getCurrentAddress(),request.recipient,request.tokenId)

            transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})
                .on("transactionHash", function (hash) {
                    console.log("got hash: " + hash)
                    txResume = {
                        "hash": hash,
                        "contractAddr": "NFT",
                        "contractNft": request.contractNft,
                        "date": Date.now(),
                        "recipient": request.recipient,
                        "tokenId": request.tokenId,
                        "gasPrice": request.gasPrice,
                        "gasLimit": request.gasLimit,
                        "nonce": nonce
                    }
                    baseWallet.getCurrentWallet().transactions.unshift(txResume)
                    sendResponse(hash)
                    baseWallet.save()

                    setTimeout(function () {
                        web3.eth.getTransaction(hash)
                            .then(function (res) {
                                if (res == null) {
                                    console.log("transaction not propagated after 60s, resending")
                                    transaction.send({gas: request.gasLimit, gasPrice: request.gasPrice, nonce: nonce})
                                }
                            })
                    }, 60000)

                })
                .on("confirmation", function (confirmationNumber, receipt){
                    if (txResume.status === undefined){
                        if (receipt.status){
                            browser.notifications.create("txNotification", {
                                "type": "basic",
                                "title": "Transaction confirmed!",
                                "iconUrl": browser.extension.getURL("/ui/images/walletLogo.png"),
                                "message": "Transaction " + txResume.hash + " confirmed"
                            });
                        }else if (receipt.status == false){
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
                    NFTsHandlers._sendTo(request, sendResponse)
                }
            })
        })
    }

    static getNFTDetails(request, sender, sendResponse){
        const nftContract = new web3.eth.Contract(ERC721_ABI, request.asset);

        nftContract.methods.name().call().then(function(name){

            nftContract.methods.tokenURI(request.tokenID).call().then(function(tokenURI){

                nftContract.methods.ownerOf(request.tokenID).call().then(function(owner){

                    sendResponse({
                        contract: request.asset,
                        tokenID: request.tokenID,
                        tokenURI: tokenURI,
                        owner: owner,
                        collection: name
                    })
                }).catch(function(){
                    sendResponse(false)
                })
            }).catch(function(){
                sendResponse(false)
            })
        }).catch(function(e){
            sendResponse(false)
        })
    }

    static addNFT(request, sender, sendResponse){
        sendResponse(baseWallet.getCurrentWallet().addNft(request.uri, request.tokenId, request.owner ,request.contract, request.collection))
    }

    static removeNFT(request, sender, sendResponse){
        baseWallet.getCurrentWallet().removeNft(request.address, request.tokenId)
    }

}

NFTsHandlers.register()
