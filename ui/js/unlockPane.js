browser.runtime.sendMessage({command: 'getBaseInfos'})
    .then(function (response) {
        if(!response.locked)
            displayWallet(response)
    })

$("#unlockBtn").click(function(){
    $("#unlockBtn").attr("disabled", true)
    browser.runtime.sendMessage({command: 'unlockWallet', password: $("#unlockPassword").val()})
        .then(function (response) {
            if(response)
                displayWallet(response)
            else{
                $("#unlockBtn").attr("disabled", false)
                $("#incorrectPassword").show()
            }
        })
})

function displayWallet(infos){
    $("#unlockPane").hide()
    $("#currentAddress").html(infos.addresses[infos.selectedAddress])
    $("#mainPane").show()
}