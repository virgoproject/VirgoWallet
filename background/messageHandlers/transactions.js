class TransactionsHandlers {

    static register(){
        addBgMessageHandler("getSpeedupGasPrice", this.getSpeedupGasPrice)
        addBgMessageHandler("speedUpTransaction", this.speedUpTransaction)
        addBgMessageHandler("getCancelGasPrice", this.getCancelGasPrice)
        addBgMessageHandler("cancelTransaction", this.cancelTransaction)
    }

    static getSpeedupGasPrice(request, sender, sendResponse){
        web3.eth.getTransaction(request.hash).then(transaction => {
            web3.eth.getGasPrice().then(res => {
                if(parseInt(transaction.gasPrice) > parseInt(res))
                    sendResponse(parseInt(transaction.gasPrice)*1.1)
                else
                    sendResponse(parseInt(res)*1.1)
            })
        })
    }

    static speedUpTransaction(request, sender, sendResponse){
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
    }

    static getCancelGasPrice(request, sender, sendResponse){
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
    }

    static cancelTransaction(request, sender, sendResponse){
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
    }

}

TransactionsHandlers.register()
