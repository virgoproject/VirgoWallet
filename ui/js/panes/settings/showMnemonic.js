/** -- Show mnemonic -- **/
$("#revealSeed").click(function(){
    //reset forms
    $("#writeMnemonic").hide()

    $("#getPassword").hide()
    $("#getPasswordInput").val("")

    $("#getPasswordBtn").attr("disabled", true)
    $("#getPasswordInput").attr("disabled", false)

    isEncrypted().then(function(isEncrypted){
        if(isEncrypted){
            $('#getPassword').show()
        }else{
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                if(mnemonicArray.length === 24) $('#settings .getMnemonic .writeMnemonic .additionalLength').show()
                $("#settings .getMnemonic .writeMnemonic .word").each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                $("#writeMnemonic").show()
            })
        }
    })

})