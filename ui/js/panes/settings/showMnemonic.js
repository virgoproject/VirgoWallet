/** -- Show mnemonic -- **/
$("#getMnemonic").click(function(){
    //reset forms
    document.getElementById("writeMnemonic").hide()

    document.getElementById("getPassword").hide()
    document.getElementById('getPasswordInput').val("")

    document.getElementById('getPasswordBtn').attr("disabled", true)
    document.getElementById('getPasswordInput').attr("disabled", false)

    isEncrypted().then(function(isEncrypted){
        if(isEncrypted){
            document.getElementById("getPassword").show()
        }else{
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                if(mnemonicArray.length === 24) $('#settings .getMnemonic .writeMnemonic .additionalLength').show()
                $("#settings .getMnemonic .writeMnemonic .word").each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                document.getElementById('writeMnemonic').show()
            })
        }
    })

})