$("#accountSelectionHeader").click(function(){
    if($("#settings").hasClass("opened")){
        $("#settings").removeClass("opened")
        $("#accountSelectionHeader").removeClass("opened")
    } else{
        $("#settings").addClass("opened")
        $("#accountSelectionHeader").addClass("opened")
    }

    //make sure settings is closed
    do {
        $("#settings .settingsPane .back").click()
    } while(mainSettingsBackLevel != 0)

})

$("#settings .mainPane .openSettings").click(function(){
    $("#settings .mainPane").hide()
    $("#settings .settingsPane").show()
    $("#settings .title").html("Settings")
})

let mainSettingsBackLevel = 0;

$("#settings .settingsPane .back").click(function(){
    if(mainSettingsBackLevel == 0){
        $("#settings .mainPane").show()
        $("#settings .settingsPane").hide()
        $("#settings .title").html("My Wallet")
        return
    }

    $("[data-settingsLevel="+mainSettingsBackLevel+"]").hide()

    if(mainSettingsBackLevel == 1)
        $("#settings .title").html("Settings")

    mainSettingsBackLevel--
})

$("#settings .settingsPane .tab").click(function(){
    const target = $("[data-settingId="+$(this).attr("data-target")+"]")

    if(target.attr("data-title"))
        $("#settings .title").html(target.attr("data-title"))

    target.show()

    mainSettingsBackLevel = target.attr("data-settingsLevel")
})


/** -- Password setup and mnemonic -- **/
$("#settings .settingsPane .tab[data-target=setupPassword]").click(function(){
    getMnemonic().then(function(mnemonic){
        const mnemonicArray = mnemonic.split(" ")
        $("#settings .settingsPane .writeMnemonic .word").each(function(index){
            $(this).find("val").html(mnemonicArray[index])
        })
        $("#settings .settingsPane .writeMnemonic").show()
    })
})

$("#settings .settingsPane .writeMnemonic button").click(function(){
    $("#settings .settingsPane .writeMnemonic").hide()
    $("#settings .settingsPane .mnemonicTest").show()
})

$("#settings .settingsPane .mnemonicTest textarea").on("input", function(){
    const value = $(this).val()
    getMnemonic().then(function(mnemonic){
        $("#settings .settingsPane .mnemonicTest button").attr("disabled", value != mnemonic)
    })
})

$("#settings .settingsPane .mnemonicTest button").click(function(){
    $("#settings .settingsPane .mnemonicTest").hide()
    $("#settings .settingsPane .setupPassword").show()
})