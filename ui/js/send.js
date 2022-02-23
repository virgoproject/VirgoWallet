function setSend(data){
    const selectedAddress = data.addresses[data.selectedAddress]
    Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
        let elem = $("<option></option>")
        elem.val(balance.contract)
        elem.attr("data-ticker", balance.ticker)
        elem.html(balance.name + " - " + balance.ticker)
        $("#body .send .sendForm .assetSelect").append(elem)
    })

    $("#body .send .sendForm .assetSelect").change()
}

$("#body .send .sendForm .assetSelect").change(function(){
    $("#body .send .sendForm .submit").attr("disabled", true);
    getAsset($(this).val()).then(function(asset){
        $("#body .send .sendForm .sendBal span").html(asset.ticker)
        $("#body .send .sendForm .sendBal val").attr("data-bal", asset.contract)

        //wait for price to be updated
        setTimeout(function(){
            $("#body .send .sendForm .amount").trigger("input")
        }, 100)

    })
})

$("#body .send .sendForm button.max").click(function (){
    $("#body .send .sendForm .amount").val($("#body .send .sendForm .sendBal val").html())
    $("#body .send .sendForm .amount").trigger("input")
})

$("#body .send .sendForm .recipient").on("input", function(){
    const input = $(this);
    if(input.val().length < 42){
        input.removeClass("is-invalid")
        $("#body .send .sendForm .submit").attr("disabled", true)
        return
    }
    validateAddress(input.val()).then(function(res){
        if(!res){
            input.addClass("is-invalid")
            $("#body .send .sendForm .submit").attr("disabled", true)
            return
        }

        input.removeClass("is-invalid")
        checkSendFormValues()
    })
})

$("#body .send .sendForm .amount").on("input", function(){
    const max = parseFloat($("#body .send .sendForm .sendBal val").html())
    const amount = parseFloat($(this).val())

    if(isNaN(amount) || amount == 0){
        $(this).removeClass("is-invalid")
        $("#body .send .sendForm .submit").attr("disabled", true)
        return
    }

    if(amount < 0 || amount > max){
        $(this).addClass("is-invalid")
        $("#body .send .sendForm .submit").attr("disabled", true)
        return
    }

    $(this).removeClass("is-invalid")
    checkSendFormValues()
})

function checkSendFormValues(){
    const recipient = $("#body .send .sendForm .recipient");
    if(recipient.val() < 42 || recipient.hasClass("is-invalid"))
        return

    const amount = $("#body .send .sendForm .amount")

    let amountVal = parseFloat(amount.val())

    if(isNaN(amountVal) || amountVal <= 0 || amount.hasClass("is-invalid"))
        return

    $("#body .send .sendForm .submit").attr("disabled", false)
}

let confirmInterval;

$("#body .send .sendForm .submit").click(function(){
    disableLoadBtn($(this))

    const recipient = $("#body .send .sendForm .recipient")
    const amount = $("#body .send .sendForm .amount")
    const asset = $("#body .send .sendForm .assetSelect")

    recipient.attr("disabled", true)
    amount.attr("disabled", true)
    asset.attr("disabled", true)
    $("#body .send .sendConfirm .submit").attr("disabled", true)
    $("#body .send .sendConfirm .submit val").html('Insufficient <val data-networkticker=""></val> balance')

    let estimateFees = function(){
        getAsset(asset.val()).then(function(assetInfos){
            estimateSendFees(recipient.val(), Math.trunc(parseFloat(amount.val())*10**assetInfos.decimals), asset.val()).then(function(fees){
                getBalance(MAIN_ASSET.ticker).then(function (nativeBalance){

                    enableLoadBtn($("#body .send .sendForm .submit"))
                    recipient.attr("disabled", false)
                    amount.attr("disabled", false)
                    asset.attr("disabled", false)

                    $("#body .send .sendForm").hide()
                    $("#body .send .sendConfirm .amount .value").html(amount.val())
                    $("#body .send .sendConfirm .amount .ticker").html(assetInfos.ticker)
                    $("#body .send .sendConfirm .recipient .value").html(recipient.val())
                    $("#body .send .sendConfirm .fees .value").html(Utils.formatAmount(fees.gasLimit * fees.gasPrice, fees.decimals))
                    $("#body .send .sendConfirm").show()

                    let totalForNative = fees.gasLimit * fees.gasPrice;
                    if(assetInfos.ticker == MAIN_ASSET.ticker)
                        totalForNative += Math.trunc(parseFloat(amount.val())*10**MAIN_ASSET.decimals)

                    if(totalForNative <= nativeBalance.balance){
                        $("#body .send .sendConfirm .submit val").html("Send")
                        $("#body .send .sendConfirm .submit").attr("disabled", false)
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

$("#body .send .sendConfirm .back").click(function(){
    if($(this).attr("disabled")) return;

    $("#body .send .sendConfirm").hide()
    $("#body .send .sendForm").show()

    clearInterval(confirmInterval)
})

$("#body .send .sendConfirm .submit").click(function(){
    disableLoadBtn($(this))
    $("#body .send .sendConfirm .back").attr("disabled", true)
    clearInterval(confirmInterval)

    const recipient = $("#body .send .sendForm .recipient")
    const amount = $("#body .send .sendForm .amount")
    const asset = $("#body .send .sendForm .assetSelect")

    getAsset(asset.val()).then(function(assetInfos){
        sendTo(recipient.val(), Math.trunc(parseFloat(amount.val())*10**assetInfos.decimals), asset.val()).then(function(res){
            notyf.success("Transaction sent!")
            recipient.val("")
            amount.val("")
            asset.val(MAIN_ASSET.contract).trigger("change")

            $("#body .send .sendConfirm .back").attr("disabled", false)
            enableLoadBtn($("#body .send .sendConfirm .submit"))

            $("#body .send .sendConfirm .back").click()
        })
    })
})