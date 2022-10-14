class TransactionsPane {

    static btn = $("#mainPane .header .pendingTxs")
    static self = $("#transactionsPane")
    static back = $("#transactionsPane .back")
    static list = {
        self: $("#transactionsPane .list"),
        basicTx: $("#transactionsBasicTx"),
        swapTx: $("#transactionsSwapTx"),
        loading: $("#transactionsPane .loading"),
        wrapper: $("#transactionsPane .listWrap"),
        empty: $("#transactionsPane .listEmpty")
    }
    static speedUp = {
        self: $("#speedupPopup"),
        body: $("#speedupPopup .body"),
        loading: $("#speedupPopup .loading"),
        amount: $("#speedupPopup .amount"),
        button: {
            self: $("#speedupPopup .button"),
            text: $("#speedupPopup .button val")
        }
    }
    static cancel = {
        self: $("#txCancelPopup"),
        body: $("#txCancelPopup .body"),
        loading: $("#txCancelPopup .loading"),
        amount: $("#txCancelPopup .amount"),
        button: {
            self: $("#txCancelPopup .button"),
            text: $("#txCancelPopup .button val")
        }
    }

    constructor() {
        this.txsCount = 0
        this.reachedEnd = false

        TransactionsPane.btn.click(function(){
            TransactionsPane.self.show()
            transactionsPane.txsCount = 0
            transactionsPane.reachedEnd = false
            transactionsPane.loadTxs()
        })

        TransactionsPane.back.click(function(){
            TransactionsPane.self.hide()
            TransactionsPane.list.self.html("")
        })

        TransactionsPane.list.wrapper.scroll(function(){
            if(transactionsPane.reachedEnd) return;

            const scrollPercent = ($(this).scrollTop() / (TransactionsPane.list.self.height() - $(this).height()))

            if(scrollPercent > 0.7){
                transactionsPane.loadTxs()
            }
        })
    }

    loadTxs() {
        TransactionsPane.list.loading.show()
        getBaseInfos().then(function(data){
            let selectedWallet = data.wallets[data.selectedWallet].wallet
            let transactions = selectedWallet.transactions

            let initialCount = transactionsPane.txsCount

            while(transactionsPane.txsCount < transactions.length && transactionsPane.txsCount-initialCount < 15){
                transactionsPane.showTransaction(selectedWallet, transactions[transactionsPane.txsCount])
                transactionsPane.txsCount++
            }

            TransactionsPane.list.loading.hide()

            if(transactionsPane.txsCount == transactions.length)
                transactionsPane.reachedEnd = true

            if(transactionsPane.txsCount == 0)
                TransactionsPane.list.empty.show()
            else
                TransactionsPane.list.empty.hide()

            transactionsPane.updateTxs(data)

        })
    }

    showTransaction(selectedWallet, transaction){
        if(transaction.contractAddr == "SWAP"){
            this.showSwapTransaction(selectedWallet, transaction)
            return
        }
        this.showBasicTransaction(selectedWallet, transaction)
    }

    showSwapTransaction(selectedWallet, transaction){
        let elem = TransactionsPane.list.swapTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        let token1;

        let logo1 = transaction.swapInfos.route[0]
        if(logo1 == selectedWallet.contract){
            token1 = {
                decimals: selectedWallet.decimals,
                ticker: selectedWallet.ticker
            }
            logo1 = selectedWallet.ticker
        }else
            token1 = selectedWallet.tokens.filter(record => record.contract == transaction.swapInfos.route[0])[0]

        elem.find(".logo.one").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + selectedWallet.ticker + "/" + logo1 + "/logo.png')")

        let token2;

        let logo2 = transaction.swapInfos.route[transaction.swapInfos.route.length-1]
        if(logo2 == selectedWallet.contract){
            token2 = {
                decimals: selectedWallet.decimals,
                ticker: selectedWallet.ticker
            }
            logo2 = selectedWallet.ticker
        }else
            token2 = selectedWallet.tokens.filter(record => record.contract == transaction.swapInfos.route[transaction.swapInfos.route.length-1])[0]

        elem.find(".logo.two").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + selectedWallet.ticker + "/" + logo2 + "/logo.png')")

        elem.find(".smallDetails .amount").html(Utils.formatAmount(transaction.swapInfos.amountIn, token1.decimals))
        elem.find(".smallDetails .ticker").html(token1.ticker)

        elem.find(".ticker.one").html(token1.ticker)
        elem.find(".ticker.two").html(token2.ticker)

        elem.find(".amountIn val").html(Utils.formatAmount(transaction.swapInfos.amountIn, token1.decimals))

        if(transaction.swapInfos.amountOut !== undefined)
            elem.find(".amountOut val").html(Utils.formatAmount(transaction.swapInfos.amountOut, token2.decimals))

        elem.attr("data-date", transaction.date)
        const date = new Date(transaction.date)

        let options = {month: "short", day: "numeric"};
        elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

        options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
        elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

        elem.find(".gasPrice val").html(Math.round((transaction.gasPrice/1000000000)))
        elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))

        elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasLimit, selectedWallet.decimals))
        elem.find(".totalFees span").html(selectedWallet.ticker)

        if(selectedWallet.explorer === undefined)
            elem.find("button").hide()
        else
            elem.find("button").click(function(){
                window.open(selectedWallet.explorer + transaction.hash, "_blank")
            })

        elem.click(function(){
            if(elem.hasClass("opened")) return

            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".close").click(function(){
            elem.removeClass("opened")
            return false
        })

        if(transaction.status !== undefined){
            elem.find(".tweakBtns").hide()
            elem.find(".badge-warning").hide()
            if(!transaction.status && transaction.canceling)
                elem.find(".badge-secondary").show()
            else
                elem.find(".badge-secondary").hide()

        }else{
            elem.find(".speed-up").click(function(){
                transactionsPane.confirmSpeedup(transaction, elem)
            })
            if(transaction.canceling){
                elem.find(".cancel").hide()
                elem.find(".badge-warning").show()
            } else
                elem.find(".cancel").click(function(){
                    transactionsPane.confirmCancel(transaction, elem)
                })
        }

        TransactionsPane.list.self.append(elem)
        elem.show()
    }

    showBasicTransaction(selectedWallet, transaction){
        let elem = TransactionsPane.list.basicTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        if(transaction.contractAddr == selectedWallet.ticker || transaction.contractAddr == "WEB3_CALL") {
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, selectedWallet.decimals))
            elem.find(".amount span").html(selectedWallet.ticker)
        } else {
            let tokenInfos = selectedWallet.tokens.filter(record => record.contract == transaction.contractAddr)[0]
            elem.find(".amount span").html(tokenInfos.ticker)
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, tokenInfos.decimals))
        }

        elem.find(".recipient").html(transaction.recipient)
        elem.find(".details .recipient").click(function(){
            copyToClipboard($(this).get(0))
            elem.find(".recipientTitle").hide()
            elem.find(".recipientCopied").show()
            setTimeout(function (){
                elem.find(".recipientTitle").show()
                elem.find(".recipientCopied").hide()
            }, 2000)
        })

        elem.attr("data-date", transaction.date)
        const date = new Date(transaction.date)

        let options = {month: "short", day: "numeric"};
        elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

        options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
        elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

        elem.find(".gasPrice val").html(Math.round((transaction.gasPrice/1000000000)))
        elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))

        elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasLimit, selectedWallet.decimals))
        elem.find(".totalFees span").html(selectedWallet.ticker)

        elem.find(".logo").css("background-image", "url('https://raw.githubusercontent.com/virgoproject/tokens/main/" + selectedWallet.ticker + "/" + transaction.contractAddr + "/logo.png')")

        if(selectedWallet.explorer === undefined)
            elem.find("button").hide()
        else
            elem.find("button").click(function(){
                window.open(selectedWallet.explorer + transaction.hash, "_blank")
            })

        elem.click(function(){
            if(elem.hasClass("opened")) return

            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".close").click(function(){
            elem.removeClass("opened")
            return false
        })

        if(transaction.status !== undefined){
            elem.find(".tweakBtns").hide()
            elem.find(".badge-warning").hide()
            if(!transaction.status && transaction.canceling)
                elem.find(".badge-secondary").show()
            else
                elem.find(".badge-secondary").hide()

        }else{
            elem.find(".speed-up").click(function(){
                transactionsPane.confirmSpeedup(transaction, elem)
            })
            if(transaction.canceling){
                elem.find(".cancel").hide()
                elem.find(".badge-warning").show()
            } else
                elem.find(".cancel").click(function(){
                    transactionsPane.confirmCancel(transaction, elem)
                })
        }


        TransactionsPane.list.self.append(elem)
        elem.show()
    }

    updateTxs(data){
        let selectedWallet = data.wallets[data.selectedWallet].wallet
        let transactions = selectedWallet.transactions

        for(let transaction of transactions){
            let elem = $("#tx"+transaction.hash)

            if(elem.length){
                if(transaction.status !== undefined){
                    elem.find(".badge-warning").hide()
                    if(!transaction.status){
                        elem.find("progress-ring").hide()
                        elem.find(".refused").show()

                        if(transaction.canceling)
                            elem.find(".badge-secondary").show()
                        else
                            elem.find(".badge-secondary").hide()

                    }else {
                        if(transaction.confirmations >= 12){
                            elem.find("progress-ring").hide()
                            elem.find(".confirmed").show()
                        }else
                            elem.find("progress-ring").attr("progress", Math.min(100, (transaction.confirmations+1)/13*100))
                    }
                    elem.find(".tweakBtns").hide()
                }else if(transaction.canceling){
                    elem.find(".cancel").hide()
                    elem.find(".badge-warning").show()
                }

                if(transaction.gasUsed !== undefined){
                    elem.find(".gasUsed").html(transaction.gasUsed.toLocaleString('en-US'))
                    elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasUsed, selectedWallet.decimals))
                }

                if(transaction.swapInfos !== undefined && transaction.swapInfos.amountOut !== undefined){
                    let token;
                    if(transaction.swapInfos.route[transaction.swapInfos.route.length-1] == selectedWallet.contract)
                        token = {
                            decimals: selectedWallet.decimals,
                            ticker: selectedWallet.ticker
                        }
                    else
                        token = selectedWallet.tokens.filter(record => record.contract == transaction.swapInfos.route[transaction.swapInfos.route.length-1])[0]

                    elem.find(".amountOut val").html(Utils.formatAmount(transaction.swapInfos.amountOut, token.decimals))
                }
            }
        }
    }

    confirmCancel(transaction, elem){
        TransactionsPane.cancel.body.hide()
        TransactionsPane.cancel.loading.show()
        TransactionsPane.cancel.self.show()

        enableLoadBtn(TransactionsPane.cancel.button.self)
        TransactionsPane.cancel.button.self.attr("disabled", true)

        getCancelGasPrice(transaction.hash).then(cancelPrice => {
            getBalance(MAIN_ASSET.ticker).then(bal => {
                const newFee = cancelPrice * transaction.gasLimit
                TransactionsPane.cancel.amount.html(Utils.formatAmount(newFee, MAIN_ASSET.decimals))
                TransactionsPane.cancel.body.show()
                TransactionsPane.cancel.loading.hide()

                if(bal.balance >= newFee) {
                    TransactionsPane.cancel.button.self.attr("disabled", false)
                    TransactionsPane.cancel.button.text.html("Cancel")
                }else{
                    TransactionsPane.cancel.button.self.attr("disabled", true)
                    TransactionsPane.cancel.button.text.html("Insufficient " + MAIN_ASSET.ticker + " balance")
                }

                TransactionsPane.cancel.button.self.unbind("click").click(function(){
                    disableLoadBtn(TransactionsPane.cancel.button.self)
                    cancelTransaction(transaction.hash, cancelPrice).then(function(){
                        TransactionsPane.cancel.self.hide()
                        notyf.success("Cancel trial sent!")
                    })
                })

            })
        })
    }

    confirmSpeedup(transaction, elem){
        TransactionsPane.speedUp.body.hide()
        TransactionsPane.speedUp.loading.show()
        TransactionsPane.speedUp.self.show()

        enableLoadBtn(TransactionsPane.speedUp.button.self)
        TransactionsPane.speedUp.button.self.attr("disabled", true)

        getSpeedupGasPrice(transaction.hash).then(gasPrice => {
            getBalance(MAIN_ASSET.ticker).then(bal => {

                const newFee = gasPrice * transaction.gasLimit

                TransactionsPane.speedUp.amount.html(Utils.formatAmount(newFee, MAIN_ASSET.decimals))
                TransactionsPane.speedUp.body.show()
                TransactionsPane.speedUp.loading.hide()

                if(bal.balance >= transaction.amount + newFee){
                    TransactionsPane.speedUp.button.self.attr("disabled", false)
                    TransactionsPane.speedUp.button.text.html("Speed up")
                }else{
                    TransactionsPane.speedUp.button.self.attr("disabled", true)
                    TransactionsPane.speedUp.button.text.html("Insufficient " + MAIN_ASSET.ticker + " balance")
                }

                TransactionsPane.speedUp.button.self.unbind("click").click(function(){
                    disableLoadBtn(TransactionsPane.speedUp.button.self)
                    speedUpTransaction(transaction.hash, gasPrice).then(hash => {
                        elem.attr("id", "tx"+hash)
                        elem.find("button").unbind("click").click(function(){
                            window.open(MAIN_ASSET.explorer + hash, "_blank")
                        })
                        elem.find(".gasPrice val").html(Math.round((gasPrice/1000000000)))
                        TransactionsPane.speedUp.self.hide()
                        notyf.success("Transaction speeded up!")
                    })
                })

            })
        })

    }

}

const transactionsPane = new TransactionsPane()