getBaseInfos().then(res => {
    $("#languageChange").val(res.selectedLanguage)
})

events.addListener("chainChanged", res => {
    $("#languageChange").val(res.selectedLanguage)
})

$('#languageChange').change(function(){
    setSelectedLanguage($('#languageChange').val())
})
