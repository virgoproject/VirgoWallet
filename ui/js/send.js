function setSend(data){
    const selectedAddress = data.addresses[data.selectedAddress]
    Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
        let elem = $("<option></option>")
        elem.val(balance.contract)
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
        $("#body .send .sendForm .submit").attr("disabled", true);
        return
    }
    validateAddress(input.val()).then(function(res){
        if(!res){
            input.addClass("is-invalid")
            $("#body .send .sendForm .submit").attr("disabled", true);
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
        $("#body .send .sendForm .submit").attr("disabled", true);
        return
    }

    if(amount < 0 || amount > max){
        $(this).addClass("is-invalid")
        $("#body .send .sendForm .submit").attr("disabled", true);
        return
    }

    $(this).removeClass("is-invalid")
    checkSendFormValues()
})

function checkSendFormValues(){
    const recipient = $("#body .send .sendForm .recipient");
    if(recipient.val() < 42 || recipient.hasClass("is-invalid"))
        return;

    const amount = $("#body .send .sendForm .amount");

    let amountVal = parseFloat(amount.val())

    if(isNaN(amountVal) || amountVal <= 0 || amount.hasClass("is-invalid"))
        return;

    $("#body .send .sendForm .submit").attr("disabled", false);
}

$("#body .send .sendForm .submit").click(function(){
    
})