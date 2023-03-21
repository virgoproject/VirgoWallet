class SendPane {

    static amount = $("#sendConfirm .amount")
    static assetSelect = $("#sendConfirm .assetSelect")
    static balance = $("#body .send .sendForm .sendBal val")
    static btnSubmit = $("#body .send .sendForm .submit")
    static recipient = $("#body .send .sendForm .recipient")
    static btnConfirm = $("#sendConfirm .submit")
    static sendForm = $("#body .send .sendForm")
    static confirmForm = $("#sendConfirm")
    static confirmFormBalance = $("#sendConfirm .balance")
    static confirmFeesForm = $("#sendConfirm .sendBtn")
    static feesForm = $("#sendConfirmFees")
    static feesFormBack = $("#sendConfirmFees .back")
    static backBtn = $("#sendConfirm .back")
    static confirmAmount = $("#sendConfirmFees .amount .value")
    static confirmTicker = $("#sendConfirmFees .amount .ticker")
    static confirmRecipient = $("#sendConfirmFees .recipient .value")
    static confirmFrom = $("#sendConfirmFees .from .value")
    static confirmFees = $("#sendConfirmFees .fees .value")
    static confirmFeesRange = $("#rangeFees")
    static sendBal = $("#body .send .sendForm .sendBal span")
    static maxBtn = $("#sendConfirm .max")
    static select = $(" #sendConfirm #sendTo")



    static btnContacts = $("#body .send .sendForm .contactButton")
    static headerValues = $(".header .stats")
    static topbarValues = $(".header .topbar")
    static contactsList = $("#contacts ")
    static bodyContacts = $('#contacts #contactDiv')
    static buttonContacts = $('#contacts .addContact')
    static divContactClone = $('#contacts .contactUser')
    static divContactList = $('#contacts .contactsList')
    static contactExemple = $('#contactEx')


    static estimateFees = null;

    constructor() {
        const _this = this
        let addrFrom
        let confirmInterval;
        SendPane.divContactList.html("")

        SendPane.btnContacts.click(function() {
            SendPane.sendForm.hide()
            SendPane.contactsList.show()
            hideStatsBar()
            SendPane.bodyContacts.show()
            SendPane.buttonContacts.show()

            ContactsPane.loadContacts()
        })


        SendPane.btnSubmit.click(function(){
            $("#body .send .sendForm").hide()
            SendPane.confirmForm.show()
            disableLoadBtn($(this))
            hideStatsBar()
            SendPane.amount.attr("disabled", true)
            SendPane.btnConfirm.attr("disabled", true)
            SendPane.btnConfirm.find("val").html('Insufficient <val data-networkticker=""></val> balance')

            $("#sendTo").change(function (){
                getAsset(SendPane.select.val()).then(function(assetInfos){
                    console.log(assetInfos)
                    let tickerBalance
                    if (assetInfos.ticker !== MAIN_ASSET.ticker){
                        tickerBalance = assetInfos.contract
                    }else{
                        tickerBalance = assetInfos.ticker
                    }
                    getBalance(tickerBalance).then(function (nativeBalance){
                        const balance =  Utils.formatAmount(nativeBalance.balance, nativeBalance.decimals)
                        let amount = $("#amountSend").val()
                        $("#sendConfirm #showCost").html(amount * Number(nativeBalance.price))
                        SendPane.confirmFormBalance.find("val").html(balance)
                        $("#sendConfirm .ticker").html(nativeBalance.ticker)
                        enableLoadBtn(SendPane.btnSubmit)
                        SendPane.recipient.attr("disabled", false)
                        SendPane.amount.attr("disabled", false)
                        SendPane.select.attr("disabled", false)

                        $("#body .send .sendForm").hide()
                    })
                })
            })

        })

        SendPane.confirmFeesForm.click(function (){
            SendPane.confirmForm.hide()
            SendPane.feesForm.show()

            getBaseInfos().then(function(res){
                const selectedAddress = res.addresses[res.selectedAddress].address
                getAsset(SendPane.select.val()).then(function(assetInfos){
                    console.log(assetInfos)
                    SendPane.confirmAmount.html(SendPane.amount.val())
                    SendPane.confirmTicker.html(assetInfos.ticker)
                    SendPane.confirmRecipient.find("val").html(SendPane.recipient.val())
                    SendPane.confirmFrom.html(selectedAddress)
                    estimateSendFees(SendPane.recipient.val(), Utils.toAtomicString(SendPane.amount.val(), assetInfos.decimals), MAIN_ASSET.ticker).then(function(fees){

                        getBalance(MAIN_ASSET.ticker).then(function (feesBalance) {
                            getBalance(assetInfos.ticker).then(function (sendBalance) {

                            let gas = fees.gasLimit
                            let decimals = MAIN_ASSET.decimals
                            let amount  = SendPane.amount.val()
                            let tag;
                            tag = document.querySelector("edit-fees")
                            let priceFees = feesBalance.price
                                let priceAmount = sendBalance.price

                            const decimal = tag.dataset.decimal = decimals
                            const lim = tag.dataset.limit = gas
                            const ticker = tag.dataset.tick = MAIN_ASSET.ticker


                            document.getElementById("from").setAttribute("data-jdenticon-value",selectedAddress)
                            document.getElementById("to").setAttribute("data-jdenticon-value",SendPane.recipient.val())

                            const tick = tag.dataset.ticker = MAIN_ASSET.ticker
                            $("#sendReviewNetFeesTicker").html(tick)
                            tag.start(gas)

                            tag.onGasChanged = () => {
                                $("#sendReviewNetFees").html(Utils.formatAmount(gas * tag.getGas(), decimals))
                                $("#sendReviewCost").html(Number(priceFees)*Number(Utils.formatAmount(gas * tag.getGas(), decimals)) + Number(priceAmount) * Number(amount) )
                                console.log(amount)
                                console.log(Number(amount)+Number(Utils.formatAmount(gas * tag.getGas(), decimals)))
                            }
                            tag.onBalance = () => {
                                $("#confirmSendBtn").find("val").html("Send")
                                $("#confirmSendBtn").attr("disabled", false)
                            }
                        })
                        })
                        })
                    })
            })

        })

        SendPane.backBtn.click(function(){
            if($(this).attr("disabled")) return;
            SendPane.btnSubmit.attr("disabled", false)
            SendPane.confirmForm.hide()
            SendPane.sendForm.show()
            clearInterval(confirmInterval)
        })

        $("#sendConfirmFees .back").click(function (){
            let tag;
            tag = document.querySelector("edit-fees")
            tag.style.marginTop = "0px"
            SendPane.feesForm.hide()
            $("#swapReview").hide()
            SendPane.confirmForm.show()
            clearInterval(confirmInterval)
            })



        $("#confirmSendBtn").click(function(){
            disableLoadBtn($(this))
            SendPane.backBtn.attr("disabled", true)
            clearInterval(confirmInterval)

            getAsset(SendPane.select.val()).then(function(assetInfos){
                sendTo(SendPane.recipient.val(),
                    SendPane.amount.val(),
                    SendPane.select.val(),
                    SendPane.confirmFees.attr("gasLimit"),
                    SendPane.confirmFees.attr("gasPrice"))
                    .then(function(res){
                        notyf.success("Transaction sent!")
                        SendPane.recipient.val("")
                        SendPane.amount.val("")
                        SendPane.select.val(MAIN_ASSET.ticker).trigger("change")

                        SendPane.backBtn.attr("disabled", false)
                        SendPane.feesForm.hide()
                        SendPane.confirmForm.hide()
                        SendPane.backBtn.click()
                    })
            })
        })

        SendPane.select.change(function(){
            SendPane.btnSubmit.attr("disabled", true)
            SendPane.amount.val("")
            getAsset($(this).val()).then(function(asset){
                SendPane.sendBal.html(asset.ticker)
                SendPane.balance.attr("data-bal", asset.contract)
                SendPane.balance.html(Utils.formatAmount(asset.balance, asset.decimals))

                //wait for price to be updated
                setTimeout(function(){
                    SendPane.amount.trigger("input")
                }, 100)

            })
        })

        $("#sendConfirm .max").click(function (){
            if(SendPane.select.val() === MAIN_ASSET.ticker){
                estimateSendFees("0x6F7AAEa1D07801f9fB0756e1849b9e440eDB25b4", Utils.toAtomicString(SendPane.confirmFormBalance.find("val").html(), MAIN_ASSET.decimals), MAIN_ASSET.ticker).then(function(fees){
                    let maxSendable = new BN(Utils.toAtomicString(SendPane.confirmFormBalance.find("val").html(), MAIN_ASSET.decimals))
                    maxSendable = maxSendable.sub(new BN(fees.gasLimit * fees.gasPrice))
                    SendPane.amount.val(Utils.formatAmount(maxSendable.toString(), MAIN_ASSET.decimals))
                    SendPane.amount.trigger("input")
                })
            }else{
                SendPane.amount.val(SendPane.confirmFormBalance.find("val").html())
                SendPane.amount.trigger("input")
            }
        })

        SendPane.recipient.on("input", function(){
            const input = $(this);
            if(input.val().length < 42){
                input.removeClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }
            validateAddress(input.val()).then(function(res){
                if(!res){
                    input.addClass("is-invalid")
                    SendPane.btnSubmit.attr("disabled", true)
                    return
                }

                input.removeClass("is-invalid")
                sendPane.checkSendFormValues()
            })
        })

        SendPane.amount.on("input", function(){
            const max = parseFloat(SendPane.balance.html())
            const amount = parseFloat($(this).val())

            if(isNaN(amount) || amount == 0){
                $(this).removeClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }

            if(amount < 0 || amount > max){
                $(this).addClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }

            $(this).removeClass("is-invalid")
            sendPane.checkSendFormValues()
        })

        events.addListener("assetsChanged", function (data){
            _this.setSend(data)
        })

        events.addListener("addressChanged", () => {
            SendPane.recipient.val("")
            SendPane.btnSubmit.attr("disabled", true)
            SendPane.amount.val("")
        })

    }

    setSend(data){
        SendPane.select.html("")
        SendPane.recipient.val("")
        SendPane.amount.val("")
        SendPane.backBtn.attr("disabled", false)
        enableLoadBtn(SendPane.btnSubmit)
        SendPane.backBtn.click()
        const selectedAddress = data.addresses[data.selectedAddress]
        Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
            if(!balance.tracked) return
            let actualAddress = data.wallets[data.selectedWallet].wallet.ticker
            let sa = ('https://raw.githubusercontent.com/virgoproject/tokens/main/" + actualAddress + "/" + balance.contract + "/logo.png')


            let elem = $("<option></option>")
            elem.val(contractAddr)
            elem.html(balance.ticker)

            if(MAIN_ASSET.contract === balance.contract)
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+MAIN_ASSET.ticker+'/'+MAIN_ASSET.ticker+'/logo.png);"></div><span class="selectText">'+MAIN_ASSET.ticker+'</span>')
            else
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+actualAddress+'/'+balance.contract+'/logo.png);"></div><span class="selectText">'+balance.ticker+'</span>')

            SendPane.select.append(elem)
        })
        SendPane.select.selectpicker('refresh');
    }

    checkSendFormValues(){
        const recipient = SendPane.recipient;
        if(recipient.val() < 42 || recipient.hasClass("is-invalid"))
            return

        let amountVal = parseFloat(SendPane.amount.val())

        if(isNaN(amountVal) || amountVal <= 0 || SendPane.amount.hasClass("is-invalid"))
            return

        SendPane.btnSubmit.attr("disabled", false)
    }
}

const sendPane = new SendPane()
