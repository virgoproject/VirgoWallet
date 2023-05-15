getBaseInfos().then(res => {
    $("#currencyConversion").val(res.selectedCurrency)

    $('#currencyConversion').change(function () {
        setSelectedcurrency($('#currencyConversion').val())
    })
})

