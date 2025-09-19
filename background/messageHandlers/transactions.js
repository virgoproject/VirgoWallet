class TransactionsHandlers {

    static register(){
        addBgMessageHandler("getTransaction", this.getTransaction)
        addBgMessageHandler("getSpeedupGasPrice", this.getSpeedupGasPrice)
        addBgMessageHandler("speedUpTransaction", this.speedUpTransaction)
        addBgMessageHandler("getCancelGasPrice", this.getCancelGasPrice)
        addBgMessageHandler("cancelTransaction", this.cancelTransaction)
    }

    static getTransaction(request, sender, sendResponse){
        sendResponse(baseWallet.getCurrentWallet().getTransaction(request.hash))
    }

    static getSpeedupGasPrice(request, sender, sendResponse){
        web3.eth.getTransaction(request.hash).then(transaction => {
            web3.eth.getGasPrice().then(res => {
                if(parseInt(transaction.gasPrice) > parseInt(res))
                    sendResponse({
                        gasPrice: parseInt(transaction.gasPrice)*1.1,
                        gasLimit: transaction.gas,
                        value: transaction.value
                    })
                else
                    sendResponse({
                        gasPrice: parseInt(res),
                        gasLimit: transaction.gas,
                        value: transaction.value
                    })
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
            web3.eth.getGasPrice().then(res => {
                if(parseInt(transaction.gasPrice) > parseInt(res)){
                    sendResponse({
                        gasPrice: parseInt(transaction.gasPrice)*1.1,
                        gasLimit: transaction.gas
                    })
                }else{
                    sendResponse({
                        gasPrice: parseInt(res),
                        gasLimit: transaction.gas
                    })
                }
            })
        })
    }

    static cancelTransaction(request, sender, sendResponse){
        web3.eth.getTransaction(request.hash).then(transaction => {
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
                changedTx.cancelHash = hash
                baseWallet.save()
                sendResponse(true)
            })
        })
    }

}

TransactionsHandlers.register()
