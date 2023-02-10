class SendPane {

    static amount = $("#body .send .sendForm .amount")
    static assetSelect = $("#sendConfirm.assetSelect")
    static balance = $("#body .send .sendForm .sendBal val")
    static btnSubmit = $("#body .send .sendForm .submit")
    static recipient = $("#body .send .sendForm .recipient")
    static btnConfirm = $("#sendConfirm .submit")
    static sendForm = $("#body .send .sendForm")
    static confirmForm = $("#sendConfirm")
    static confirmFeesForm = $("#sendConfirm .sendFees")
    static feesForm = $("#sendConfirmFees")
    static backBtn = $("#sendConfirm .back")
    static confirmAmount = $("#sendConfirm .amount .value")
    static confirmTicker = $("#sendConfirm .amount .ticker")
    static confirmRecipient = $("#sendConfirm .recipient .value")
    static confirmFees = $("#sendConfirm .fees .value")
    static confirmFeesRange = $("#rangeFees")
    static sendBal = $("#body .send .sendForm .sendBal span")
    static maxBtn = $("#body .send .sendForm button.max")



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
            SendPane.recipient.attr("disabled", true)
            SendPane.amount.attr("disabled", true)
            SendPane.assetSelect.attr("disabled", true)
            SendPane.btnConfirm.attr("disabled", true)
            SendPane.btnConfirm.find("val").html('Insufficient <val data-networkticker=""></val> balance')

            SendPane.estimateFees = function(){
                getAsset(SendPane.assetSelect.val()).then(function(assetInfos){
                    console.log(assetInfos)
                    estimateSendFees(SendPane.recipient.val(), Utils.toAtomicString(SendPane.amount.val(), assetInfos.decimals), SendPane.assetSelect.val()).then(function(fees){
                        getBalance(MAIN_ASSET.ticker).then(function (nativeBalance){

                            if(fees.gasLimit === undefined || isBtnDisabled(SendPane.btnConfirm)) return

                            let gas = fees.gasLimit
                            let decimals = fees.decimals
                            let tag;
                            tag = document.querySelector("edit-fees")
                            const decimal = tag.dataset.decimal = decimals
                            const lim = tag.dataset.limit = gas
                            const tick = tag.dataset.ticker = MAIN_ASSET.ticker
                            $(".feesTicker").html(ticker)
                            tag.start(gas)

                            tag.onGasChanged = () => {
                                $(".fees .value").html(Utils.formatAmount(gas * tag.getGas(), decimals))
                            }
                            tag.onBalance = () => {
                                $(".sendConfirm .button").find("val").html("Send")
                                $(".sendConfirm .button").attr("disabled", false)
                            }

                            enableLoadBtn(SendPane.btnSubmit)
                            SendPane.recipient.attr("disabled", false)
                            SendPane.amount.attr("disabled", false)
                            SendPane.assetSelect.attr("disabled", false)

                            $("#body .send .sendForm").hide()
                            SendPane.confirmAmount.html(SendPane.amount.val())
                            SendPane.confirmTicker.html(assetInfos.ticker)
                            SendPane.confirmRecipient.html(SendPane.recipient.val())



                        })
                    })
                })
            }

            SendPane.estimateFees()
            confirmInterval = setInterval(function(){
                SendPane.estimateFees()
            }, 2500)

        })

        SendPane.confirmFeesForm.click(function (){
            SendPane.confirmForm.hide()
            SendPane.feesForm.show()

        })

        SendPane.backBtn.click(function(){
            if($(this).attr("disabled")) return;
            SendPane.btnSubmit.attr("disabled", false)
            SendPane.confirmForm.hide()
            SendPane.sendForm.show()
            clearInterval(confirmInterval)
        })

        SendPane.confirmFeesRange.on("input", function(){
            SendPane.btnConfirm.attr("disabled", true)
            SendPane.estimateFees()
        })

        SendPane.btnConfirm.click(function(){
            disableLoadBtn($(this))
            SendPane.backBtn.attr("disabled", true)
            clearInterval(confirmInterval)

            getAsset(SendPane.assetSelect.val()).then(function(assetInfos){
                sendTo(SendPane.recipient.val(),
                    SendPane.amount.val(),
                    SendPane.assetSelect.val(),
                    SendPane.confirmFees.attr("gasLimit"),
                    SendPane.confirmFees.attr("gasPrice"))
                    .then(function(res){
                        notyf.success("Transaction sent!")
                        SendPane.recipient.val("")
                        SendPane.amount.val("")
                        SendPane.assetSelect.val(MAIN_ASSET.ticker).trigger("change")

                        SendPane.backBtn.attr("disabled", false)
                        enableLoadBtn(SendPane.btnConfirm)

                        SendPane.backBtn.click()
                    })
            })
        })

        SendPane.assetSelect.change(function(){
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

        SendPane.maxBtn.click(function (){
            if(SendPane.assetSelect.val() == MAIN_ASSET.ticker){
                estimateSendFees("0x6F7AAEa1D07801f9fB0756e1849b9e440eDB25b4", Utils.toAtomicString(SendPane.balance.html(), MAIN_ASSET.decimals), MAIN_ASSET.ticker).then(function(fees){
                    let maxSendable = new BN(Utils.toAtomicString(SendPane.balance.html(), MAIN_ASSET.decimals))
                    maxSendable = maxSendable.sub(new BN(fees.gasLimit * fees.gasPrice))
                    SendPane.amount.val(Utils.formatAmount(maxSendable.toString(), MAIN_ASSET.decimals))
                    SendPane.amount.trigger("input")
                })
            }else{
                SendPane.amount.val(SendPane.balance.html())
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
        SendPane.assetSelect.html("")
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
            elem.attr("data-ticker", balance.ticker)
            elem.html(balance.name + " - " + balance.ticker)
            SendPane.assetSelect.append(elem)
        })

        SendPane.assetSelect.change()
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
