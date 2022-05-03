class PendingTxsPane {

    static btn = $("#mainPane .header .pendingTxs")
    static self = $("#pendingTxsPane")
    static back = $("#pendingTxsPane .back")
    static list = {
        self: $("#pendingTxsPane .list"),
        base: $("#pendingTxsBaseTx"),
        loading: $("#pendingTxsPane .loading"),
        wrapper: $("#pendingTxsPane .listWrap"),
        empty: $("#pendingTxsPane .listEmpty")
    }

    constructor() {
        this.txsCount = 0
        this.reachedEnd = false

        PendingTxsPane.btn.click(function(){
            PendingTxsPane.self.show()
            pendingTxsPane.txsCount = 0
            pendingTxsPane.reachedEnd = false
            pendingTxsPane.loadTxs()
        })

        PendingTxsPane.back.click(function(){
            PendingTxsPane.self.hide()
            PendingTxsPane.list.self.html("")
        })

        PendingTxsPane.list.wrapper.scroll(function(){
            if(pendingTxsPane.reachedEnd) return;

            const scrollPercent = ($(this).scrollTop() / (PendingTxsPane.list.self.height() - $(this).height()))

            if(scrollPercent > 0.7){
                pendingTxsPane.loadTxs()
            }
        })
    }

    loadTxs() {
        PendingTxsPane.list.loading.show()
        getBaseInfos().then(function(data){
            let selectedWallet = data.wallets[data.selectedWallet].wallet
            let transactions = selectedWallet.transactions

            let initialCount = pendingTxsPane.txsCount

            while(pendingTxsPane.txsCount < transactions.length && pendingTxsPane.txsCount-initialCount < 15){
                pendingTxsPane.showTransaction(selectedWallet, transactions[pendingTxsPane.txsCount])
                pendingTxsPane.txsCount++
            }

            PendingTxsPane.list.loading.hide()

            if(pendingTxsPane.txsCount == transactions.length)
                pendingTxsPane.reachedEnd = true

            if(pendingTxsPane.txsCount == 0)
                PendingTxsPane.list.empty.show()
            else
                PendingTxsPane.list.empty.hide()

            pendingTxsPane.updateTxs(data)

        })
    }

    showTransaction(selectedWallet, transaction){
        let elem = PendingTxsPane.list.base.clone()
        elem.attr("id", "tx"+transaction.hash)

        if(transaction.contractAddr == selectedWallet.ticker) {
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, selectedWallet.decimals))
            elem.find(".amount b").html(selectedWallet.ticker)
        } else {
            let tokenInfos = selectedWallet.tokens.filter(record => record.contract == transaction.contractAddr)[0]
            elem.find(".amount b").html(tokenInfos.ticker)
            elem.find(".amount val").html(Utils.formatAmount(transaction.amount, tokenInfos.decimals))
        }

        elem.find(".recipient").html(transaction.recipient)

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

        elem.click(function(){
            if(elem.hasClass("opened")) return

            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".close").click(function(){
            elem.removeClass("opened")
            return false
        })

        PendingTxsPane.list.self.append(elem)
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

const pendingTxsPane = new PendingTxsPane()
