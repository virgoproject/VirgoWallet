class SendPane {

    static amount = $("#body .send .sendForm .amount")
    static assetSelect = $("#body .send .sendForm .assetSelect")
    static balance = $("#body .send .sendForm .sendBal val")
    static btnSubmit = $("#body .send .sendForm .submit")
    static recipient = $("#body .send .sendForm .recipient")
    static btnConfirm = $("#body .send .sendConfirm .submit")
    static sendForm = $("#body .send .sendForm")
    static confirmForm = $("#body .send .sendConfirm")
    static backBtn = $("#body .send .sendConfirm .back")
    static confirmAmount = $("#body .send .sendConfirm .amount .value")
    static confirmTicker = $("#body .send .sendConfirm .amount .ticker")
    static confirmRecipient = $("#body .send .sendConfirm .recipient .value")
    static confirmFees = $("#body .send .sendConfirm .fees .value")
    static sendBal = $("#body .send .sendForm .sendBal span")
    static maxBtn = $("#body .send .sendForm button.max")

    constructor() {

        let confirmInterval;

        SendPane.btnSubmit.click(function(){
            disableLoadBtn($(this))

            SendPane.recipient.attr("disabled", true)
            SendPane.amount.attr("disabled", true)
            SendPane.assetSelect.attr("disabled", true)
            SendPane.btnConfirm.attr("disabled", true)
            SendPane.btnConfirm.find("val").html('Insufficient <val data-networkticker=""></val> balance')

            let estimateFees = function(){
                getAsset(SendPane.assetSelect.val()).then(function(assetInfos){
                    estimateSendFees(SendPane.recipient.val(), Math.trunc(parseFloat(SendPane.amount.val())*10**assetInfos.decimals), SendPane.assetSelect.val()).then(function(fees){
                        getBalance(MAIN_ASSET.ticker).then(function (nativeBalance){

                            if(fees.gasLimit === undefined || isBtnDisabled(SendPane.btnConfirm)) return

                            enableLoadBtn(SendPane.btnSubmit)
                            SendPane.recipient.attr("disabled", false)
                            SendPane.amount.attr("disabled", false)
                            SendPane.assetSelect.attr("disabled", false)

                            SendPane.sendForm.hide()
                            SendPane.confirmAmount.html(SendPane.amount.val())
                            SendPane.confirmTicker.html(assetInfos.ticker)
                            SendPane.confirmRecipient.html(SendPane.recipient.val())
                            SendPane.confirmFees.html(Utils.formatAmount(fees.gasLimit * fees.gasPrice, fees.decimals))
                            SendPane.confirmForm.show()

                            let totalForNative = fees.gasLimit * fees.gasPrice;
                            if(assetInfos.ticker == MAIN_ASSET.ticker)
                                totalForNative += Math.trunc(parseFloat(SendPane.amount.val())*10**MAIN_ASSET.decimals)

                            if(totalForNative <= nativeBalance.balance){
                                SendPane.btnConfirm.find("val").html("Send")
                                SendPane.btnConfirm.attr("disabled", false)
                            }

                        })
                    })
                })
            }

            estimateFees()
            confirmInterval = setInterval(function(){
                estimateFees()
            }, 2500)

        })

        SendPane.backBtn.click(function(){
            if($(this).attr("disabled")) return;

            SendPane.confirmForm.hide()
            SendPane.sendForm.show()

            clearInterval(confirmInterval)
        })

        SendPane.btnConfirm.click(function(){
            disableLoadBtn($(this))
            SendPane.backBtn.attr("disabled", true)
            clearInterval(confirmInterval)

            getAsset(SendPane.assetSelect.val()).then(function(assetInfos){
                sendTo(SendPane.recipient.val(), Math.trunc(parseFloat(SendPane.amount.val())*10**assetInfos.decimals), SendPane.assetSelect.val()).then(function(res){
                    notyf.success("Transaction sent!")
                    SendPane.recipient.val("")
                    SendPane.amount.val("")
                    SendPane.assetSelect.val(MAIN_ASSET.contract).trigger("change")

                    SendPane.backBtn.attr("disabled", false)
                    enableLoadBtn(SendPane.btnConfirm)

                    SendPane.backBtn.click()
                })
            })
        })

        SendPane.assetSelect.change(function(){
            SendPane.btnSubmit.attr("disabled", true);
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
            SendPane.amount.val(SendPane.balance.html())
            SendPane.amount.trigger("input")
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

    }

    setSend(data){
        const selectedAddress = data.addresses[data.selectedAddress]
        Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
            let elem = $("<option></option>")
            elem.val(balance.contract)
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
