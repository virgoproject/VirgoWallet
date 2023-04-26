/** -- Show mnemonic -- **/
$("#revealSeed").click(function(){
    SettingsPane.getMnemonic.write.hide()

    SettingsPane.getMnemonic.password.hide()
    SettingsPane.getMnemonic.self.show()
    SettingsPane.getMnemonic.passwordInput.val("")

    SettingsPane.getMnemonic.passwordBtn.attr("disabled", true)
    SettingsPane.getMnemonic.passwordInput.attr("disabled", false)

    isEncrypted().then(function(isEncrypted){
        if(isEncrypted){
            SettingsPane.getMnemonic.password.show()
        }else{
            getMnemonic().then(function(mnemonic){
                const mnemonicArray = mnemonic.split(" ")
                if(mnemonicArray.length === 24) SettingsPane.getMnemonic.additionalWords.show()
                SettingsPane.getMnemonic.words.each(function(index){
                    $(this).find("val").html(mnemonicArray[index])
                })
                SettingsPane.getMnemonic.write.show()
            })
        }
    })

})