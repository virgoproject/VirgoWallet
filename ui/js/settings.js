function setSettings(data){
    let i = 0;
    for(const addressObj of data.addresses){
        const address = addressObj.address

        const elem = $("#baseAccountRow").clone()
        elem.find("svg").attr("data-jdenticon-value", address)
        elem.find(".address").html(address)

        const mainAssetBalance = addressObj.balances[data.wallets[data.selectedWallet].wallet.ticker]
        elem.find(".balance").html(Utils.formatAmount(mainAssetBalance.balance, mainAssetBalance.decimals))
        elem.find(".ticker").html(mainAssetBalance.ticker)

        elem.attr("data-addressId", i)
        elem.find(".balance").attr("data-accountMainBalance", address)

        if(data.selectedAddress == i){
            $("#accountSelectionHeader svg").attr("data-jdenticon-value", address)
            elem.addClass("selected")
        }

        elem.click(function(){
            if(elem.hasClass("selected")) return

            changeAccount(elem.attr("data-addressId")).then(function(){
                $("#settings .accounts .account.selected").removeClass("selected")
                elem.addClass("selected")
                $("#accountSelectionHeader").click()
                $("#accountSelectionHeader svg").attr("data-jdenticon-value", address)
                jdenticon()
            })
        })

        $("#settings .accounts").append(elem)
        elem.show()
        i++
    }
    jdenticon()
}

$("#settings .addAccount").click(function(){
    addAccount().then(function(data){
        const baseElem = $("#baseAccountRow").clone()
        $("#settings .accounts").html("")
        $("#settings .accounts").append(baseElem)

        setSettings(data)
    })
})

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

    //reset forms
    $("#settings .setupPassword .writeMnemonic").hide()
    $("#settings .setupPassword .mnemonicTest").hide()
    $("#settings .setupPassword .setupPassword").hide()
    $("#settings .setupPassword .getOldPassword").hide()

    $("#settings .setupPassword .mnemonicTest textarea").val("")
    $("#settings .setupPassword .setupPassword input").val("")
    $("#settings .setupPassword .getOldPassword input").val("")

    $("#settings .setupPassword .mnemonicTest button").attr("disabled", true)
    $("#settings .setupPassword .setupPassword button").attr("disabled", true)
    $("#settings .setupPassword .getOldPassword button").attr("disabled", true)
    $("#settings .setupPassword .getOldPassword input").attr("disabled", false)

    isEncrypted().then(function(isEncrypted){
        if(isEncrypted){
            $("#settings .setupPassword .getOldPassword").show()
        }else{
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                $("#settings .setupPassword .writeMnemonic .word").each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                $("#settings .setupPassword .writeMnemonic").show()
            })
        }
    })

})

$("#settings .setupPassword .writeMnemonic button").click(function(){
    $("#settings .setupPassword .writeMnemonic").hide()
    $("#settings .setupPassword .mnemonicTest").show()
})

$("#settings .setupPassword .mnemonicTest textarea").on("input", function(){
    const value = $(this).val()
    getMnemonic().then(function(mnemonic){
        $("#settings .setupPassword .mnemonicTest button").attr("disabled", value != mnemonic)
    })
})

$("#settings .setupPassword .mnemonicTest button").click(function(){
    $("#settings .setupPassword .mnemonicTest").hide()
    $("#settings .setupPassword .setupPassword").show()
})

$("#settings .setupPassword .setupPassword input").click(function(){
    $("#settings .setupPassword .setupPassword input").removeClass("is-invalid")
    $("#settings .setupPassword .setupPassword .error").hide()
})

$("#settings .setupPassword .setupPassword input").on("input", function(){
    const input1 = $("#settings .setupPassword .setupPassword input").eq(0)
    const input2 = $("#settings .setupPassword .setupPassword input").eq(1)

    $("#settings .setupPassword .setupPassword button").attr("disabled", input1.val().length < 8 || input2.val().length < 8)
})

$("#settings .setupPassword .setupPassword button").click(function(){
    const input1 = $("#settings .setupPassword .setupPassword input").eq(0)
    const input2 = $("#settings .setupPassword .setupPassword input").eq(1)

    if(input1.val() != input2.val()){
        $("#settings .setupPassword .setupPassword input").addClass("is-invalid")
        $("#settings .setupPassword .setupPassword .error").show()
        return
    }

    const btn = $(this)

    disableLoadBtn(btn)

    setPassword(input1.val(), $("#settings .setupPassword .getOldPassword input").val()).then(function(){
        enableLoadBtn(btn)
        notyf.success("Password changed!")
        $("#accountSelectionHeader").click()
    })
})

$("#settings .settingsPane .getOldPassword input").click(function(){
    $("#settings .setupPassword .getOldPassword input").removeClass("is-invalid")
    $("#settings .setupPassword .getOldPassword .error").hide()
})

$("#settings .settingsPane .getOldPassword input").on("input", function(){
    $("#settings .setupPassword .getOldPassword button").attr("disabled", $(this).val().length < 8)
})

$("#settings .setupPassword .getOldPassword button").click(function(){
    $("#settings .setupPassword .getOldPassword input").attr("disabled", true)

    passwordMatch($("#settings .setupPassword .getOldPassword input").val())
        .then(function(match){
            if(!match){
                $("#settings .setupPassword .getOldPassword input").addClass("is-invalid")
                $("#settings .setupPassword .getOldPassword .error").show()
                $("#settings .setupPassword .getOldPassword input").attr("disabled", false)
                return
            }
            $("#settings .setupPassword .getOldPassword").hide()
            $("#settings .setupPassword .setupPassword").show()
        })
})


/** -- Show mnemonic -- **/
$("#settings .settingsPane .tab[data-target=getMnemonic]").click(function(){

    //reset forms
    $("#settings .getMnemonic .writeMnemonic").hide()

    $("#settings .getMnemonic .getPassword").hide()
    $("#settings .getMnemonic .getPassword input").val("")

    $("#settings .getMnemonic .getPassword button").attr("disabled", true)
    $("#settings .getMnemonic .getPassword input").attr("disabled", false)

    isEncrypted().then(function(isEncrypted){
        if(isEncrypted){
            $("#settings .getMnemonic .getPassword").show()
        }else{
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                $("#settings .getMnemonic .writeMnemonic .word").each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                $("#settings .getMnemonic .writeMnemonic").show()
            })
        }
    })

})

$("#settings .getMnemonic .getPassword input").click(function(){
    $("#settings .getMnemonic .getPassword input").removeClass("is-invalid")
    $("#settings .getMnemonic .getPassword .error").hide()
})

$("#settings .getMnemonic .getPassword input").on("input", function(){
    $("#settings .getMnemonic .getPassword button").attr("disabled", $(this).val().length < 8)
})

$("#settings .getMnemonic .getPassword button").click(function(){
    $("#settings .getMnemonic .getPassword input").attr("disabled", true)

    passwordMatch($("#settings .getMnemonic .getPassword input").val())
        .then(function(match){
            if(!match){
                $("#settings .getMnemonic .getPassword input").addClass("is-invalid")
                $("#settings .getMnemonic .getPassword .error").show()
                $("#settings .getMnemonic .getPassword input").attr("disabled", false)
                return
            }
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                $("#settings .getMnemonic .writeMnemonic .word").each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                $("#settings .getMnemonic .getPassword").hide()
                $("#settings .getMnemonic .writeMnemonic").show()
            })
        })
})