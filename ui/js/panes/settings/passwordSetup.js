class passwordsetup
{

    constructor() {
        /** -- Password setup and mnemonic -- **/
        $("#settings .settingsPane .tab[data-target=setupPassword]").click(function(){

            //reset forms
            SettingsPane.setupPassword.mnemonic.hide()
            SettingsPane.setupPassword.test.hide()
            SettingsPane.setupPassword.setup.hide()
            SettingsPane.setupPassword.oldPassword.hide()

            SettingsPane.setupPassword.testText.val("")
            SettingsPane.setupPassword.setupInput.val("")
            SettingsPane.setupPassword.oldPasswordInput.val("")

            SettingsPane.setupPassword.testBtn.attr("disabled", true)
            SettingsPane.setupPassword.setupBtn.attr("disabled", true)
            SettingsPane.setupPassword.oldPasswordBtn.attr("disabled", true)
            SettingsPane.setupPassword.oldPasswordInput.attr("disabled", false)

            isEncrypted().then(function(isEncrypted){
                if(isEncrypted){
                    SettingsPane.setupPassword.oldPassword.show()
                }else{
                    getMnemonic().then(function(mnemonic){
                        const mnemonicArray = mnemonic.split(" ")
                        SettingsPane.setupPassword.writeWords.each(function(index){
                            $(this).find("val").html(mnemonicArray[index])
                        })
                        SettingsPane.setupPassword.mnemonic.show()
                    })
                }
            })

        })


        SettingsPane.setupPassword.writeBtn.click(function(){
            SettingsPane.setupPassword.mnemonic.hide()
            SettingsPane.setupPassword.test.show()
        })

        SettingsPane.setupPassword.testText.on("input", function(){
            const value = $(this).val()
            getMnemonic().then(function(mnemonic){
                SettingsPane.setupPassword.testBtn.attr("disabled", value != mnemonic)
            })
        })

        SettingsPane.setupPassword.testBtn.click(function(){
            SettingsPane.setupPassword.test.hide()
            SettingsPane.setupPassword.setup.show()
        })

        SettingsPane.setupPassword.setupInput.click(function(){
            SettingsPane.setupPassword.setupInput.removeClass("is-invalid")
            SettingsPane.setupPassword.setupErr.hide()
        })

        SettingsPane.setupPassword.setupInput.on("input", function(){
            const input1 = SettingsPane.setupPassword.setupInput.eq(0)
            const input2 = SettingsPane.setupPassword.setupInput.eq(1)

            SettingsPane.setupPassword.setupBtn.attr("disabled", input1.val().length < 8 || input2.val().length < 8)
        })

        SettingsPane.setupPassword.setupBtn.click(function(){
            const input1 = SettingsPane.setupPassword.setupInput.eq(0)
            const input2 = SettingsPane.setupPassword.setupInput.eq(1)

            if(input1.val() != input2.val()){
                SettingsPane.setupPassword.setupInput.addClass("is-invalid")
                SettingsPane.setupPassword.setupErr.show()
                return
            }

            const btn = $(this)

            disableLoadBtn(btn)

            setPassword(input1.val(), SettingsPane.setupPassword.oldPasswordInput.val()).then(function(){
                enableLoadBtn(btn)
                notyf.success("Password changed!")
                SettingsPane.accountSelectionHeader.click()
            })
        })

        SettingsPane.oldPassword.input.click(function(){
            SettingsPane.setupPassword.oldPasswordInput.removeClass("is-invalid")
            SettingsPane.oldPassword.err.hide()
        })

        SettingsPane.oldPassword.input.on("input", function(){
            SettingsPane.setupPassword.oldPasswordBtn.attr("disabled", $(this).val().length < 8)
        })

        SettingsPane.setupPassword.oldPasswordBtn.click(function(){
            SettingsPane.setupPassword.oldPasswordInput.attr("disabled", true)

            passwordMatch(SettingsPane.setupPassword.oldPasswordInput.val())
                .then(function(match){
                    if(!match){
                        SettingsPane.setupPassword.oldPasswordInput.addClass("is-invalid")
                        SettingsPane.oldPassword.err.show()
                        SettingsPane.setupPassword.oldPasswordInput.attr("disabled", false)
                        return
                    }
                    SettingsPane.setupPassword.oldPassword.hide()
                    SettingsPane.setupPassword.setup.show()
                })
        })

        SettingsPane.getMnemonic.passwordInput.click(function(){
            SettingsPane.getMnemonic.passwordInput.removeClass("is-invalid")
            SettingsPane.getMnemonic.passwordErr.hide()
        })

        SettingsPane.getMnemonic.passwordInput.on("input", function(){
            SettingsPane.getMnemonic.passwordBtn.attr("disabled", $(this).val().length < 8)
        })

        SettingsPane.getMnemonic.passwordBtn.click(function(){
            SettingsPane.getMnemonic.passwordInput.attr("disabled", true)

            passwordMatch(SettingsPane.getMnemonic.passwordInput.val())
                .then(function(match){
                    if(!match){
                        SettingsPane.getMnemonic.passwordInput.addClass("is-invalid")
                        SettingsPane.getMnemonic.passwordErr.show()
                        SettingsPane.getMnemonic.passwordInput.attr("disabled", false)
                        return
                    }
                    getMnemonic().then(function(mnemonic){
                        const mnemonicArray = mnemonic.split(" ")
                        SettingsPane.getMnemonic.words.each(function(index){
                            $(this).find("val").html(mnemonicArray[index])
                        })
                        SettingsPane.getMnemonic.password.hide()
                        SettingsPane.getMnemonic.write.show()
                    })
                })
        })
    }
}


const passwordSetup = new passwordSetup()