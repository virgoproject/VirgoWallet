browser.runtime.sendMessage({command: 'getBaseInfos'})
    .then(function (response) {
        console.log(response)
        if(!response.locked){
            $("#unlockPane").hide()
            $("#currentAddress").html(response.addresses[response.selectedAddress])
            $("#mainPane").show()
        }
    })

$("#unlockBtn").click(function(){
    $("#unlockBtn").attr("disabled", true)
    browser.runtime.sendMessage({command: 'unlockWallet', password: $("#unlockPassword").val()})
        .then(function (response) {

        })
})