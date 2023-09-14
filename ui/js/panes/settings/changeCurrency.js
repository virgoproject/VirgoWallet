getBaseInfos().then(res => {
    $("#currencyConversion").val(res.selectedCurrency)
})

events.addListener("chainChanged", res => {
    $("#currencyConversion").val(res.selectedCurrency)
})

$('#currencyConversion').change(function(){
    setSelectedCurrency($('#currencyConversion').val())
})
