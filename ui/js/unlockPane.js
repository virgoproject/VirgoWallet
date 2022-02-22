browser.runtime.sendMessage({command: 'getBaseInfos'})
    .then(function (response) {
        if(!response.locked)
            displayWallet(response)
    })

$("#unlockPanePassword").on("input", function(){
    $("#unlockPanePasswordSubmit").prop("disabled", $(this).val().length < 8);
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

function displayWallet(data){
    $("#unlockPane").hide()
    setChains(data)
    setResume(data)
    setSend(data)
    setSettings(data)
    $("#mainPane").show()
}

$("#unlockPane .passwordBox .recover").click(function(){
    $("#unlockPane .passwordBox").hide()
    $("#unlockPane .recoverBox").show()
})

$("#unlockPane .recoverBox .back").click(function(){
    $("#unlockPane .passwordBox").show()
    $("#unlockPane .recoverBox").hide()
})

$("#recoverPaneMnemonic").on("input", function(){
    $("#recoverPaneMnemonicSubmit").prop("disabled", $(this).val().split(" ").length < 12);
});

$("#recoverPaneMnemonic").click(function(){
    $(this).removeClass("is-invalid");
    $("#recoverPaneMnemonicWrong").hide();
    $("#recoverPaneMnemonicBase").show();
});

$("#recoverPaneMnemonicSubmit").click(function(){
    disableLoadBtn($(this))
    restoreFromMnemonic($("#recoverPaneMnemonic").val()).then(function(response){
        if(response)
            displayWallet(response)
        else{
            enableLoadBtn($("#recoverPaneMnemonicSubmit"))
            $("#recoverPaneMnemonic").addClass("is-invalid");
            $("#recoverPaneMnemonicWrong").show();
            $("#recoverPaneMnemonicBase").hide();

            setTimeout(function (){
                if($("#recoverPaneMnemonicBase").is(":hidden")){
                    $("#recoverPaneMnemonic").removeClass("is-invalid");
                    $("#recoverPaneMnemonicWrong").hide();
                    $("#recoverPaneMnemonicBase").show();
                }
            }, 5000)
        }
    })
})