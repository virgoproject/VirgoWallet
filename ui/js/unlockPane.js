class UnlockPane {

    static password = $("#unlockPanePassword")
    static passSubmit = $("#unlockPanePasswordSubmit")
    static passWrong = $("#unlockPanePasswordWrong")
    static passBase = $("#unlockPanePasswordBase")
    static recoverBtn = $("#unlockPane .passwordBox .recover")
    static passwordBox = $("#unlockPane .passwordBox")
    static recoverBox = {
        self: $("#unlockPane .recoverBox"),
        back: $("#unlockPane .recoverBox .back"),
        mnemonic: $("#recoverPaneMnemonic"),
        submit: $("#recoverPaneMnemonicSubmit"),
        msgBase: $("#recoverPaneMnemonicBase"),
        msgWrong: $("#recoverPaneMnemonicWrong")
    }

    constructor() {
        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                if(!response.locked)
                    unlockPane.displayWallet(response)
            })

        UnlockPane.password.on("input", function(){
            UnlockPane.passSubmit.prop("disabled", $(this).val().length < 8);
        });

        UnlockPane.password.click(function(){
            $(this).removeClass("is-invalid");
            UnlockPane.passWrong.hide();
            UnlockPane.passBase.show();
        });

        UnlockPane.passSubmit.click(function(){
            disableLoadBtn($(this))
            browser.runtime.sendMessage({command: 'unlockWallet', password: UnlockPane.password.val()})
                .then(function (response) {
                    if(response)
                        unlockPane.displayWallet(response)
                    else{
                        enableLoadBtn(UnlockPane.passSubmit)
                        UnlockPane.password.addClass("is-invalid");
                        UnlockPane.passWrong.show();
                        UnlockPane.passBase.hide();

                        setTimeout(function (){
                            if(UnlockPane.passBase.is(":hidden")){
                                UnlockPane.password.removeClass("is-invalid");
                                UnlockPane.passWrong.hide();
                                UnlockPane.passBase.show();
                            }
                        }, 5000)
                    }
                })
        })

        UnlockPane.recoverBtn.click(function(){
            UnlockPane.passwordBox.hide()
            UnlockPane.recoverBox.self.show()
        })

        UnlockPane.recoverBox.back.click(function(){
            UnlockPane.passwordBox.show()
            UnlockPane.recoverBox.self.hide()
        })

        UnlockPane.recoverBox.mnemonic.on("input", function(){
            UnlockPane.recoverBox.submit.prop("disabled", $(this).val().split(" ").length < 12);
        });

        UnlockPane.recoverBox.mnemonic.click(function(){
            $(this).removeClass("is-invalid");
            UnlockPane.recoverBox.msgWrong.hide();
            UnlockPane.recoverBox.msgBase.show();
        });

        UnlockPane.recoverBox.submit.click(function(){
            disableLoadBtn($(this))
            restoreFromMnemonic(UnlockPane.recoverBox.mnemonic.val()).then(function(response){
                if(response)
                    this.displayWallet(response)
                else{
                    enableLoadBtn(UnlockPane.recoverBox.submit)
                    UnlockPane.recoverBox.mnemonic.addClass("is-invalid");
                    UnlockPane.recoverBox.msgWrong.show();
                    UnlockPane.recoverBox.msgBase.hide();

                    setTimeout(function (){
                        if(UnlockPane.recoverBox.msgBase.is(":hidden")){
                            UnlockPane.recoverBox.mnemonic.removeClass("is-invalid");
                            UnlockPane.recoverBox.msgWrong.hide();
                            UnlockPane.recoverBox.msgBase.show();
                        }
                    }, 5000)
                }
            })
        })

    }

    displayWallet(data){
        $("#unlockPane").hide()
        selectChains.setChains(data)
        mainPane.setResume(data)
        sendPane.setSend(data)
        settingsPane.setSettings(data)
        $("#mainPane").show()
    }

}

const unlockPane = new UnlockPane()
