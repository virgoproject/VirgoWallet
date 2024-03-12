class UnlockPane {

    static password = $("#unlockPanePassword")
    static passSubmit = $("#unlockPanePasswordSubmit")
    static passWrong = $("#unlockPanePasswordWrong")
    static passBase = $("#unlockPanePasswordBase")
    static recoverBtn = $("#unlockPane .passwordBox .recover")
    static passwordBox = $("#unlockPane .passwordBox")
    static createpane = $('#createPane')
    static recoverBox = {
        self: $("#unlockPane .recoverBox"),
        back: $("#unlockPane .recoverBox .back"),
        mnemonic: $("#recoverPaneMnemonic"),
        submit: $("#recoverPaneMnemonicSubmit"),
        msgBase: $("#recoverPaneMnemonicBase"),
        msgWrong: $("#recoverPaneMnemonicWrong")
    }
    static loadingPane = $("#loadingPane")

    static self = $("#unlockPane")

    constructor() {

        const _this = this

        browser.runtime.sendMessage({command: 'getBaseInfos'})
            .then(function (response) {
                UnlockPane.loadingPane.hide()
                UnlockPane.self.show()
                if(response.locked){
                    _this.displayUnlock(response.biometricsEnabled)
                }else{
                    unlockPane.displayWallet(response)
                    if(!response.setupDone)
                        UnlockPane.createpane.show()
                    else {
                        UnlockPane.createpane.hide()
                        tutorialPane.checkDisplay()
                    }
                }
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
                    UnlockPane.password.val("")
                    if(response){
                        unlockPane.displayWallet(response)
                        enableLoadBtn(UnlockPane.passSubmit)
                        UnlockPane.passSubmit.prop("disabled", true)
                    }else{
                        enableLoadBtn(UnlockPane.passSubmit)
                        UnlockPane.passSubmit.prop("disabled", true)
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
                enableLoadBtn(UnlockPane.recoverBox.submit)
                if(response){
                    unlockPane.displayWallet(response)
                } else {
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
        console.log(data)
        $("#unlockPane").hide()
        UnlockPane.createpane.hide()
        mainPane.setResume(data)
        swapPane.setSwap(data)
        atomicSwapPane.setAtomicSwap(data)
        $("#mainPane").show()
    }

    displayUnlock(useBiometrics){
        $("#mainPane").hide()
        $("#unlockPane").show()

        if(useBiometrics && IS_MOBILE){
            reactMessaging.isBiometricsAvailable().then(res => {
                if(res.success){
                    reactMessaging.getPassword().then(res => {
                        if(res.password === undefined) return

                        UnlockPane.password.val(res.password)
                        UnlockPane.passSubmit.click()
                    })
                }
            })
        }

    }

}


const unlockPane = new UnlockPane()
