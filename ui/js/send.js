function setSend(data){
    const selectedAddress = data.addresses[data.selectedAddress]
    Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
        let elem = $("<option></option>")
        elem.val(balance.contract)
        elem.html(balance.name)
        $("#body .send .sendForm .assetSelect").append(elem)
    })
}

$("#body .send .sendForm .assetSelect").change(function(){
    getAsset($(this).val()).then(function(asset){
        $("#body .send .sendForm .sendMax span").html(asset.ticker)
    })
})