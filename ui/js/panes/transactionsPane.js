class TransactionsPane {

    static btn = $("#mainPane .header .pendingTxs")
    static self = $("#transactionsPane")
    static All = $("#transactionsPane #paneAll")
    static Transaction = $("#transactionsPane #paneTransac")
    static back = $("#transactionsPane .back")
    static list = {
        self: $("#transactionsPane .list"),
        basicTx: $("#transactionsBasicTx"),
        notifTx: $("#transactionsNotifTx"),
        swapTx: $("#transactionsSwapTx"),
        atomicSwapTx: $("#transactionsAtomicSwapTx"),
        tokenTx:$("#transactionsTokenForTokenSwapTx"),
        approveTx: $('#transactionsApproveTx'),
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
        this.countDate = 0
        this.reachedEnd = false

        TransactionsPane.btn.click(function(){
            TransactionsPane.self.show()
            hideStatsBar()
            transactionsPane.txsCount = 0
            transactionsPane.reachedEnd = false
            transactionsPane.loadTxs()
        })

        TransactionsPane.All.click(function (){
            $("#all").addClass("paneSelected")
            $("#transac").removeClass("paneSelected")
        })

        TransactionsPane.Transaction.click(function (){
            $("#transac").addClass("paneSelected")
            $("#all").removeClass("paneSelected")
        })

        TransactionsPane.back.click(function(){
            TransactionsPane.self.hide()
            showStatsBar()
            TransactionsPane.list.self.html("")
        })

        $("#transactionsPane #all").click(function (){
            transactionsPane.txsCount = 0
            TransactionsPane.list.self.empty()
            transactionsPane.loadTxs()
        })

        $("#transactionsPane #transac").click(function (){
            transactionsPane.txsCount = 0
            TransactionsPane.list.self.empty()
            transactionsPane.loadTxs()
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
        getBaseInfos().then(function(data){
            let selectedWallet = data.wallets[data.selectedWallet].wallet
            let transactions = selectedWallet.transactions
            let initialCount = transactionsPane.txsCount
            let options = {month: "short", day: "numeric"};

            if ($("#transactionsPane #all").hasClass("paneSelected")){
                while(transactionsPane.txsCount < transactions.length && transactionsPane.txsCount-initialCount < 15){

                    transactionsPane.showDate(transactions[transactionsPane.txsCount])
                    transactionsPane.showTransaction(selectedWallet, transactions[transactionsPane.txsCount])

                    transactionsPane.txsCount++
                }
            }

            if ($("#transactionsPane #transac").hasClass("paneSelected")){
                while(transactionsPane.txsCount < transactions.length && transactionsPane.txsCount-initialCount < 15){

                    transactionsPane.showDate(transactions[transactionsPane.txsCount])
                    transactionsPane.showTransaction(selectedWallet, transactions[transactionsPane.txsCount])

                    transactionsPane.txsCount++
                }
            }


            if(transactionsPane.txsCount == transactions.length)
                transactionsPane.reachedEnd = true

            if(transactionsPane.txsCount == 0)
                TransactionsPane.list.empty.show()
            else
                TransactionsPane.list.empty.hide()

            console.log("sucepute")

            transactionsPane.updateTxs(data)

        })
    }

    showTransaction(selectedWallet, transaction){
        switch (transaction.contractAddr){
            case "SWAP":
                this.showSwapTransaction(selectedWallet, transaction)
                break
            case "APPROVETOKEN":
                this.showApprovedTransaction(selectedWallet, transaction)
                break
            case 'WEB3_SWAP':
                this.showSwapTokenForTokenTransaction(selectedWallet, transaction)
                break
            case 'NOTIF':
                this.showNotifTransaction(selectedWallet, transaction)
                break
            case 'ATOMICSWAP':
                this.showAtomicSwapTransaction(transaction)
                break
            default:
                this.showBasicTransaction(selectedWallet, transaction)
                break
        }
    }

    showDate(tx){
        let elem = $('#txDate').clone()
        let options = {month: "short", day: "numeric"};
        let dates = new Date(tx.date)
        let today = new Date(Date.now())

            if( !$("#transactionsPane .list #txDate .setUpDate").hasClass(dates.toLocaleDateString("en-US", options))){
                if (dates.toLocaleDateString("en-US", options) !== today.toLocaleDateString("en-US", options)){
                    elem.find(".setUpDate").addClass(dates.toLocaleDateString("en-US", options))
                    console.log(dates.toLocaleDateString("en-US", options))
                    elem.find('.setUpDate').html(dates.toLocaleDateString("en-US", options))
                    TransactionsPane.list.self.append(elem)
                }else{
                    elem.find(".setUpDate").addClass(dates.toLocaleDateString("en-US", options))
                    console.log(dates.toLocaleDateString("en-US", options))
                    elem.find('.setUpDate').html("Today")
                    TransactionsPane.list.self.append(elem)
                }
            }
        elem.show()
    }

    showNotifTransaction(selectedWallet, transaction){
        let elem = TransactionsPane.list.notifTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        if (transaction.status === false){
            elem.find(".status").html("Canceled")
            elem.addClass('refusedTx').removeClass('pendingTx');
        }

        if (transaction.status === true){
            elem.find(".status").html("Confirmed")
            elem.addClass('confirmedTx').removeClass('pendingTx');
        }

        const date = new Date(transaction.date)

        elem.find(".recipient").html(transaction.recipient)
        elem.find(".addr val").html(transaction.recipient)

        elem.find(" .time").html(date.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))
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
        let options = {hour: "2-digit", minute: "2-digit"}



        options = {month: "short", day: "numeric"};
        elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

        options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
        elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

        elem.find(".gasPrice val").html(Math.round((transaction.gasPrice/1000000000)))
        //elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))

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
            elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".closeChevron").click(function(){
            if(!elem.hasClass("opened")) return
            elem.removeClass("opened")
            elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
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

    showAtomicSwapTransaction(transaction){
        let elem = TransactionsPane.list.atomicSwapTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        if (transaction.swapInfos.status === -1){
            elem.find(".status").html("Canceled")
            elem.addClass('refusedTx').removeClass('pendingTx');
        }

        if (transaction.swapInfos.status === 3){
            elem.find(".status").html("Confirmed")
            elem.addClass('confirmedTx').removeClass('pendingTx');
        }

        let token1 = {
            decimals: 18,
            ticker: transaction.swapInfos.tickerA
        }


        let token2 = {
            decimals: 18,
            ticker: transaction.swapInfos.tickerB
        }

        const dateswap = new Date(transaction.date)

        elem.find(" .time").html(dateswap.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))

        elem.find(".smallDetails .amount").html(Utils.formatAmount(transaction.swapInfos.amountIn, token1.decimals))
        elem.find(".title .tickerA").html(token1.ticker)
        elem.find(".title .tickerB").html(token2.ticker)

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

        elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasLimit, token1.decimals))
        elem.find(".totalFees span").html(token1.ticker)

        elem.click(function(){
            if(elem.hasClass("opened")) return
            elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".closeChevron").click(function(){
            if(!elem.hasClass("opened")) return
            elem.removeClass("opened")
            elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
            return false
        })

        if(transaction.swapInfos.status !== undefined){
            elem.find(".tweakBtns").hide()
            elem.find(".badge-warning").hide()
            if(!transaction.swapInfos.status && transaction.canceling)
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

        this.updateAtomicSwapTx(elem, transaction)
    }

    showApprovedTransaction(selecteWallet, transaction){
        let elem = TransactionsPane.list.approveTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        if (transaction.status === false){
            elem.find(".status").html("Canceled")
            elem.addClass('refusedTx').removeClass('pendingTx');
        }

        if (transaction.status === true){
            elem.find(".status").html("Granted")
            elem.addClass('confirmedTx').removeClass('pendingTx');
        }

        if (transaction.origin !== undefined){
            elem.find(".site").html(transaction.origin.replace(/^https?:\/\//, ''))
        }

        elem.find(".details .siteAdress").html(transaction.allowed.address)
        elem.find(".recipient").html(transaction.recipient)

        elem.find(".details .siteAdress").click(function(){
            copyToClipboard($(this).get(0))
            elem.find(".SiteTitle").hide()
            elem.find(".SiteCopied").show()
            setTimeout(function (){
                elem.find(".SiteTitle").show()
                elem.find(".SiteCopied").hide()
            }, 2000)
        })

        getTokenDetails(transaction.recipient).then(function (det){
            elem.find(".token").html(det.symbol)
        })

        elem.find(".details .recipient").click(function(){
            copyToClipboard($(this).get(0))
            elem.find(".recipientTitle").hide()
            elem.find(".recipientCopied").show()
            setTimeout(function (){
                elem.find(".recipientTitle").show()
                elem.find(".recipientCopied").hide()
            }, 2000)
        })

        const dateswap = new Date(transaction.date)

        elem.find(" .timeApprove").html(dateswap.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))

        elem.attr("data-date", transaction.date)
        const date = new Date(transaction.date)

        let options = {month: "short", day: "numeric"};
        elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

        options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
        elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

        elem.find(".gasPrice val").html(Math.round((transaction.gasPrice/1000000000)))
        elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))

        elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasLimit, selecteWallet.decimals))

        elem.find(".totalFees span").html(selecteWallet.ticker)

        elem.find(".logo").css("background-image", "url(https://www.pngall.com/wp-content/uploads/10/PancakeSwap-Crypto-Logo-PNG.png)")

        if(selecteWallet.explorer === undefined)
            elem.find("button").hide()
        else
            elem.find("button").click(function(){
                window.open(selecteWallet.explorer + transaction.hash, "_blank")
            })

        elem.click(function(){
            if(elem.hasClass("opened")) return

            elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".closeChevron").click(function(){
            if(!elem.hasClass("opened")) return
            elem.removeClass("opened")
            elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
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

    showSwapTokenForTokenTransaction(selectWallet, transaction){
        console.log(transaction)
        if (transaction.swap !== undefined) {

            let elem = TransactionsPane.list.tokenTx.clone()
            elem.attr("id", "tx" + transaction.hash)
            elem.find(".logo").css("background-image", "url(https://www.pngall.com/wp-content/uploads/10/PancakeSwap-Crypto-Logo-PNG.png)")

            if (transaction.swap.name !== "exactInputSingle"){
                getTokenDetails(transaction.swap.params[2].value[0]).then(function (token1) {
                    elem.find(".ticker.one").html(token1.symbol)
                    elem.find(".amountIn val").html(Utils.formatAmount(transaction.swap.params[0].value, token1.decimals))
                })
            }else{
                getTokenDetails(transaction.swap.params[0].value[1]).then(function (token1) {
                    elem.find(".ticker.one").html(token1.symbol)
                    elem.find(".amountIn val").html(Utils.formatAmount(transaction.swap.params[0].value[5], token1.decimals))
                })
            }

            if (transaction.swap.name !== "exactInputSingle"){
                let tokenAdr = transaction.swap.params[2].value.length - 1
                getTokenDetails(transaction.swap.params[2].value[tokenAdr]).then(function (token2){
                    elem.find(".ticker.two").html(token2.symbol)
                    if(transaction.swap.params[2].value !== undefined)
                        elem.find(".amountOut val").html(Utils.formatAmount(transaction.swap.params[1].value, token2.decimals))
                })
            }else {
                getTokenDetails(transaction.swap.params[0].value[0]).then(function (token2){
                    elem.find(".ticker.two").html(token2.symbol)

                    if(transaction.swap.params[0].value !== undefined)
                        elem.find(".amountOut val").html(Utils.formatAmount(transaction.amount, token2.decimals))
                })
            }

            if (transaction.status === false){
                elem.find(".status").html("Canceled")
                elem.addClass('refusedTx').removeClass('pendingTx');
            }

            if (transaction.status === true){
                elem.find(".status").html("Confirmed")
                elem.addClass('confirmedTx').removeClass('pendingTx');
            }

            if (transaction.origin !== undefined){
                elem.find(".site").html(transaction.origin.replace(/^https?:\/\//, ''))
            }

            const dateswap = new Date(transaction.date)

            elem.find(".time").html(dateswap.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))

            elem.attr("data-date", transaction.date)
            const date = new Date(transaction.date)

            let options = {month: "short", day: "numeric"};
            elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

            options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
            elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

            elem.find(".gasPrice val").html(Math.round((transaction.gasPrice / 1000000000)))
            elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))

            elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice * transaction.gasLimit, selectWallet.decimals))
            elem.find(".totalFees span").html(selectWallet.ticker)

            if (selectWallet.explorer === undefined)
                elem.find("button").hide()
            else
                elem.find("button").click(function () {
                    window.open(selectWallet.explorer + transaction.hash, "_blank")
                })

            elem.click(function () {
                if (elem.hasClass("opened")) return

                elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
                elem.addClass("opened")
            })

            elem.find(".closeChevron").click(function(){
                elem.removeClass("opened")
                elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
                return false
            })

            if (transaction.status !== undefined) {
                elem.find(".tweakBtns").hide()
                elem.find(".badge-warning").hide()
                if (!transaction.status && transaction.canceling)
                    elem.find(".badge-secondary").show()
                else
                    elem.find(".badge-secondary").hide()

            } else {
                elem.find(".speed-up").click(function () {
                    transactionsPane.confirmSpeedup(transaction, elem)
                })
                if (transaction.canceling) {
                    elem.find(".cancel").hide()
                    elem.find(".badge-warning").show()
                } else
                    elem.find(".cancel").click(function () {
                        transactionsPane.confirmCancel(transaction, elem)
                    })
            }

            TransactionsPane.list.self.append(elem)
            elem.show()
        }
    }

    showSwapTransaction(selectedWallet, transaction){
        let elem = TransactionsPane.list.swapTx.clone()
        elem.attr("id", "tx"+transaction.hash)

        let token1;

        if (transaction.status === false){
            elem.find(".status").html("Canceled")
            elem.addClass('refusedTx').removeClass('pendingTx');
        }

        if (transaction.status === true){
            elem.find(".status").html("Confirmed")
            elem.addClass('confirmedTx').removeClass('pendingTx');
        }

        let logo1 = transaction.swapInfos.route[0]
        if(logo1 == selectedWallet.contract){
            token1 = {
                decimals: selectedWallet.decimals,
                ticker: selectedWallet.ticker
            }
            logo1 = selectedWallet.ticker
        }else
            token1 = selectedWallet.tokens.filter(record => record.contract == transaction.swapInfos.route[0])[0]


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


        const dateswap = new Date(transaction.date)

        elem.find(" .time").html(dateswap.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))

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

            elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
            $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
            elem.addClass("opened")
        })

        elem.find(".closeChevron").click(function(){
            if(!elem.hasClass("opened")) return
            elem.removeClass("opened")
            elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
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
        try {
            let elem = TransactionsPane.list.basicTx.clone()
            elem.attr("id", "tx"+transaction.hash)

            if(transaction.contractAddr == selectedWallet.ticker || transaction.contractAddr == "WEB3_CALL") {
                elem.find(".amount val").html(Utils.formatAmount(transaction.amount, selectedWallet.decimals))
                elem.find(".amount span").html(selectedWallet.ticker)
            } else {
                let tokenInfos = selectedWallet.tokens.filter(record => record.contract == transaction.contractAddr)[0]
                console.log(tokenInfos)
                elem.find(".amount span").html(tokenInfos.ticker)
                elem.find(".amount val").html(Utils.formatAmount(transaction.amount, tokenInfos.decimals))
            }
            const date = new Date(transaction.date)

            elem.find(".recipient").html(transaction.recipient)
            elem.find(".addr val").html(transaction.recipient)

            elem.find(" .time").html(date.toLocaleTimeString("fr-EU", {hour: "2-digit", minute: "2-digit"}))
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
            let options = {hour: "2-digit", minute: "2-digit"}

            if (transaction.status === false){
                elem.find(".status").html("Canceled")
                elem.addClass('refusedTx').removeClass('pendingTx');
            }

            if (transaction.status === true){
                elem.find(".status").html("Confirmed")
                elem.addClass('confirmedTx').removeClass('pendingTx');
            }

            options = {month: "short", day: "numeric"};
            elem.find(".smallDetails .date").html(date.toLocaleDateString("en-US", options))

            options = {month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}
            elem.find(".details .date").html(date.toLocaleDateString("en-US", options))

            elem.find(".gasPrice val").html(Math.round((transaction.gasPrice/1000000000)))
            elem.find(".gasLimit").html(transaction.gasLimit.toLocaleString('en-US'))
            console.log(transaction)
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

                elem.find(".closeChevron").addClass("fa-xmark").removeClass("fa-chevron-right")
                $("#pendingTxsPane .list .listItem.opened").removeClass("opened")
                elem.addClass("opened")
            })

            elem.find(".closeChevron").click(function(){
                if(!elem.hasClass("opened")) return
                elem.removeClass("opened")
                elem.find(".closeChevron").removeClass("fa-xmark").addClass("fa-chevron-right")
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
        }catch(e){
            console.log(e)
        }
    }

    updateAtomicSwapTx(elem, transaction){

        if(transaction.swapInfos.gasUsed !== undefined){
            elem.find(".gasUsed").html(transaction.swapInfos.gasUsed.toLocaleString('en-US'))
            elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.swapInfos.gasUsed, 18))
        }

        if(transaction.swapInfos.status == -1){
            elem.find("progress-ring").hide()
            elem.find(".refused").show()
            return
        }
        if(transaction.swapInfos.status == 3){
            elem.find("progress-ring").hide()
            elem.find(".confirmed").show()
            return
        }
        const progress = Math.min(100, (transaction.swapInfos.status+1)/4*100)

        elem.find("progress-ring").attr("progress", progress)
    }


    updateTxs(data){
        let selectedWallet = data.wallets[data.selectedWallet].wallet
        let transactions = selectedWallet.transactions

        for(let transaction of transactions){
            let elem = $("#tx"+transaction.hash)

            if(elem.length){
                if(transaction.contractAddr == "ATOMICSWAP"){
                    this.updateAtomicSwapTx(elem, transaction)
                    continue
                }

                if(transaction.status !== undefined){
                    elem.find(".badge-warning").hide()
                    if(!transaction.status){
                        console.log("hiding")
                        elem.find("progress-ring").hide()
                        elem.find(".status").html("Canceled")
                        elem.addClass('refusedTx').removeClass('pendingTx');

                        if(transaction.canceling)
                            elem.find(".badge-secondary").show()
                        else
                            elem.find(".badge-secondary").hide()

                    }else {
                        if(transaction.confirmations >= 12){
                            console.log("hiding")
                            elem.find("progress-ring").hide()
                            elem.find(".status").html("Confirmed")
                            elem.addClass('confirmedTx').removeClass('pendingTx');
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
                    elem.find(".totalFees val").html(Utils.formatAmount(transaction.gasPrice*transaction.gasLimit, selectedWallet.decimals))
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
                const newFee = new BN(cancelPrice).mul(new BN(transaction.gasLimit))
                TransactionsPane.cancel.amount.html(Utils.formatAmount(newFee.toString(), MAIN_ASSET.decimals))
                TransactionsPane.cancel.body.show()
                TransactionsPane.cancel.loading.hide()

                if(new BN(bal.balance).gte(newFee)) {
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

                const newFee = new BN(gasPrice).mul(new BN(transaction.gasLimit))

                TransactionsPane.speedUp.amount.html(Utils.formatAmount(newFee.toString(), MAIN_ASSET.decimals))
                TransactionsPane.speedUp.body.show()
                TransactionsPane.speedUp.loading.hide()

                if(new BN(bal.balance).gte(new BN(transaction.amount).add(newFee))){
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
