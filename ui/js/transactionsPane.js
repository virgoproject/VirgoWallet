class TransactionsPane {

    static btn = $("#mainPane .header .pendingTxs")
    static self = $("#transactionsPane")
    static back = $("#transactionsPane .back")
    static list = {
        self: $("#transactionsPane .list"),
        base: $("#transactionsBaseTx"),
        loading: $("#transactionsPane .loading"),
        wrapper: $("#transactionsPane .listWrap"),
        empty: $("#transactionsPane .listEmpty")
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
        let elem = TransactionsPane.list.base.clone()
        elem.attr("id", "tx"+transaction.hash)

        if(transaction.contractAddr == selectedWallet.ticker || transaction.contractAddr == "WEB3_CALL") {
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, selectedWallet.decimals))
            elem.find(".amount b").html(selectedWallet.ticker)
        } else {
            let tokenInfos = selectedWallet.tokens.filter(record => record.contract == transaction.contractAddr)[0]
            elem.find(".amount b").html(tokenInfos.ticker)
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, tokenInfos.decimals))
        }

        elem.find(".recipient").html(transaction.recipient)
        elem.find(".recipient").click(function(){
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
        elem.find(".totalFees b").html(selectedWallet.ticker)

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
                    if(!transaction.status){
                        elem.find("progress-ring").hide()
                        elem.find(".refused").show()
                    }else {
                        if(transaction.confirmations >= 12){
                            elem.find("progress-ring").hide()
                            elem.find(".confirmed").show()
                        }else
                            elem.find("progress-ring").attr("progress", Math.min(100, (transaction.confirmations+1)/13*100))
                    }
                }

                if(transaction.gasUsed !== undefined){
                    elem.find(".gasUsed").html(transaction.gasUsed.toLocaleString('en-US'))
                    elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasUsed, selectedWallet.decimals))
                }
            }
        }
    }

}

const transactionsPane = new TransactionsPane()
