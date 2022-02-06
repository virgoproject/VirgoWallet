browser.runtime.sendMessage({command: 'getBaseInfos'})
    .then(function (response) {
        if(!response.locked)
            displayWallet(response)
    })

$("#unlockPanePassword").on("input", function(){
    if ($(this).val().length >= 8)
        $("#unlockPanePasswordSubmit").prop("disabled", false);
    else
        $("#unlockPanePasswordSubmit").prop("disabled", true);
});

$("#unlockPanePassword").click(function(){
    $(this).removeClass("is-invalid");
    $("#unlockPanePasswordWrong").hide();
    $("#unlockPanePasswordBase").show();
});

$("#unlockPanePasswordSubmit").click(function(){
    disableLoadBtn($(this))
    browser.runtime.sendMessage({command: 'unlockWallet', password: $("#unlockPanePassword").val()})
        .then(function (response) {
            if(response)
                displayWallet(response)
            else{
                enableLoadBtn($("#unlockPanePasswordSubmit"))
                $("#unlockPanePassword").addClass("is-invalid");
                $("#unlockPanePasswordWrong").show();
                $("#unlockPanePasswordBase").hide();

                setTimeout(function (){
                    if($("#unlockPanePasswordBase").is(":hidden")){
                        $("#unlockPanePassword").removeClass("is-invalid");
                        $("#unlockPanePasswordWrong").hide();
                        $("#unlockPanePasswordBase").show();
                    }
                }, 5000)
            }
        })
})

function displayWallet(infos){
    $("#unlockPane").hide()
    console.log(infos.wallets[infos.selectedWallet])
    $("#mainPaneCurrentChain").html(infos.wallets[infos.selectedWallet].wallet.name)
    $("#mainPane").show()
}