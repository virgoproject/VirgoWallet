class SettingsPane {

    static settings = $("#settings")
    static main = $("#settings .mainPane")
    static settingsMain = $("#settings .settingsPane")
    static accountSelectionHeader = $("#accountSelectionHeader")
    static accountSelectionHeaderSvg = $("#accountSelectionHeader svg")
    static accounts = $("#settings .accounts")
    static baseAccountRow = $("#baseAccountRow")
    static addAccountBtn = $("#settings .addAccount")
    static settingsBackBtn = $("#settings .settingsPane .back")
    static settingsTitle = $("#settings .title")
    static openSettingsBtn = $("#settings .mainPane .openSettings")
    static openSupportBtn = $("#settings .mainPane .openSupport")
    static setupPassword = {
        mnemonic: $("#settings .setupPassword .writeMnemonic"),
        test: $("#settings .setupPassword .mnemonicTest"),
        testText: $("#settings .setupPassword .mnemonicTest textarea"),
        testBtn: $("#settings .setupPassword .mnemonicTest button"),
        setup: $("#settings .setupPassword .setupPassword"),
        setupInput: $("#settings .setupPassword .setupPassword input"),
        setupBtn: $("#settings .setupPassword .setupPassword button"),
        setupErr: $("#settings .setupPassword .setupPassword .error"),
        oldPassword: $("#settings .setupPassword .getOldPassword"),
        oldPasswordInput: $("#settings .setupPassword .getOldPassword input"),
        oldPasswordBtn: $("#settings .setupPassword .getOldPassword button"),
        writeWords: $("#settings .setupPassword .writeMnemonic .word"),
        writeBtn: $("#settings .setupPassword .writeMnemonic button")
    }
    static oldPassword = {
        input: $("#settings .settingsPane .getOldPassword input"),
        err: $("#settings .setupPassword .getOldPassword .error")
    }
    static getMnemonic = {
        write: $("#settings .getMnemonic .writeMnemonic"),
        password: $("#settings .getMnemonic .getPassword"),
        passwordInput: $("#settings .getMnemonic .getPassword input"),
        passwordBtn: $("#settings .getMnemonic .getPassword button"),
        passwordErr: $("#settings .getMnemonic .getPassword .error"),
        words: $("#settings .getMnemonic .writeMnemonic .word")
    }
    static importMnemonic = {
        warn: $("#settings .importMnemonic .mnemonicWarn"),
        warnBtn: $("#settings .importMnemonic .mnemonicWarn button"),
        ask: $("#settings .importMnemonic .mnemonicAsk"),
        askText: $("#settings .importMnemonic .mnemonicAsk textarea"),
        askBtn: $("#settings .importMnemonic .mnemonicAsk button"),
        askInput: $("#settings .importMnemonic .mnemonicAsk input"),
        label: {
            err: $("#settings .importMnemonic .mnemonicAsk .label.error"),
            normal: $("#settings .importMnemonic .mnemonicAsk .label.normal")
        }
    }

    constructor() {
        SettingsPane.addAccountBtn.click(function(){
            addAccount().then(function(data){
                const baseElem = $("#baseAccountRow").clone()
                SettingsPane.accounts.html("")
                SettingsPane.accounts.append(baseElem)

                settingsPane.setSettings(data)
            })
        })

        SettingsPane.accountSelectionHeader.click(function(){
            if(SettingsPane.settings.hasClass("opened")){
                SettingsPane.settings.removeClass("opened")
                SettingsPane.accountSelectionHeader.removeClass("opened")
            } else{
                SettingsPane.settings.addClass("opened")
                SettingsPane.accountSelectionHeader.addClass("opened")
            }

            //make sure settings is closed
            do {
                SettingsPane.settingsBackBtn.click()
            } while(mainSettingsBackLevel != 0)

            //close transaction pane
            if(TransactionsPane.self.is(":visible"))
                TransactionsPane.back.click()
        })

        SettingsPane.openSettingsBtn.click(function(){
            SettingsPane.main.hide()
            SettingsPane.settingsMain.show()
            SettingsPane.settingsTitle.html("Settings")
        })

        let mainSettingsBackLevel = 0;

        SettingsPane.settingsBackBtn.click(function(){
            if(mainSettingsBackLevel == 0){
                SettingsPane.main.show()
                SettingsPane.settingsMain.hide()
                SettingsPane.settingsTitle.html("My Wallet")
                return
            }

            $("[data-settingsLevel="+mainSettingsBackLevel+"]").hide()

            if(mainSettingsBackLevel == 1)
                SettingsPane.settingsTitle.html("Settings")

            mainSettingsBackLevel--
        })

        $("#settings .settingsPane .tab").click(function(){
            const target = $("[data-settingId="+$(this).attr("data-target")+"]")

            if(target.attr("data-title"))
                SettingsPane.settingsTitle.html(target.attr("data-title"))

            target.show()

            mainSettingsBackLevel = target.attr("data-settingsLevel")
        })


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


        /** -- Show mnemonic -- **/
        $("#settings .settingsPane .tab[data-target=getMnemonic]").click(function(){

            //reset forms
            SettingsPane.getMnemonic.write.hide()

            SettingsPane.getMnemonic.password.hide()
            SettingsPane.getMnemonic.passwordInput.val("")

            SettingsPane.getMnemonic.passwordBtn.attr("disabled", true)
            SettingsPane.getMnemonic.passwordInput.attr("disabled", false)

            isEncrypted().then(function(isEncrypted){
                if(isEncrypted){
                    SettingsPane.getMnemonic.password.show()
                }else{
                    getMnemonic().then(function(mnemonic){
                        const mnemonicArray = mnemonic.split(" ")
                        SettingsPane.getMnemonic.words.each(function(index){
                            $(this).find("val").html(mnemonicArray[index])
                        })
                        SettingsPane.getMnemonic.write.show()
                    })
                }
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


        /** -- Restore from mnemonic -- **/
        $("#settings .settingsPane .tab[data-target=importMnemonic]").click(function(){
            //reset forms
            SettingsPane.importMnemonic.warn.hide()
            SettingsPane.importMnemonic.ask.show()

            SettingsPane.importMnemonic.askText.val("")
            SettingsPane.importMnemonic.askBtn.attr("disabled", true)
            SettingsPane.importMnemonic.askInput.attr("disabled", false)
        })

        SettingsPane.importMnemonic.askText.on("input", function(){
            SettingsPane.importMnemonic.askBtn.prop("disabled", $(this).val().split(" ").length < 12);
        });

        SettingsPane.importMnemonic.askText.click(function(){
            $(this).removeClass("is-invalid")
            SettingsPane.importMnemonic.label.err.hide()
            SettingsPane.importMnemonic.label.normal.show()
        });

        SettingsPane.importMnemonic.askBtn.click(function(){
            disableLoadBtn($(this))
            isMnemonicValid(SettingsPane.importMnemonic.askText.val()).then(function(response){
                enableLoadBtn(SettingsPane.importMnemonic.askBtn)
                SettingsPane.importMnemonic.askBtn.attr("disabled", true)
                if(!response){
                    SettingsPane.importMnemonic.label.normal.hide()
                    SettingsPane.importMnemonic.label.err.show()
                    SettingsPane.importMnemonic.askText.addClass("is-invalid")

                    setTimeout(function (){
                        if(SettingsPane.importMnemonic.label.normal.is(":hidden")){
                            SettingsPane.importMnemonic.askText.removeClass("is-invalid")
                            SettingsPane.importMnemonic.label.err.hide()
                            SettingsPane.importMnemonic.label.normal.show()
                        }
                    }, 5000)
                    return
                }
                SettingsPane.importMnemonic.ask.hide()
                SettingsPane.importMnemonic.warn.show()
            })
        })

        SettingsPane.importMnemonic.warnBtn.click(function(){
            disableLoadBtn($(this))
            restoreFromMnemonic(SettingsPane.importMnemonic.askText.val()).then(function(data){
                setTimeout(function(){

                    //reset current display
                    //chain selection
                    let elem = SelectChains.baseChainRow.clone()
                    SelectChains.selector.html("")
                    SelectChains.selector.append(elem)
                    selectChains.setChains(data)
                    //settings
                    elem = SettingsPane.baseAccountRow.clone()
                    SettingsPane.accounts.html("")
                    SettingsPane.accounts.append(elem)
                    settingsPane.setSettings(data)
                    //assets
                    elem = MainPane.baseAssetRow.clone()
                    MainPane.walletAssets.html("")
                    MainPane.walletAssets.append(elem)
                    mainPane.displayData(data)
                    //send form
                    SendPane.recipient.val("")
                    SendPane.amount.val("")
                    SendPane.backBtn.attr("disabled", false)
                    enableLoadBtn(SendPane.btnSubmit)
                    SendPane.backBtn.click()
                    SendPane.assetSelect.html("")
                    sendPane.setSend(data)

                    enableLoadBtn(SettingsPane.importMnemonic.warnBtn)
                    notyf.success("Wallet recovered!")
                    SettingsPane.accountSelectionHeader.click()
                }, 2000)
            })
        })

        SettingsPane.openSupportBtn.click(function(){
            browser.windows.create({
                url: "https://virgo.net/support"
            })
        })
    }

    setSettings(data){
        let i = 0;
        for(const addressObj of data.addresses){
            const address = addressObj.address

            const elem = SettingsPane.baseAccountRow.clone()
            elem.find("svg").attr("data-jdenticon-value", address)
            elem.find(".address").html(address)

            const mainAssetBalance = addressObj.balances[data.wallets[data.selectedWallet].wallet.ticker]
            elem.find(".balance").html(Utils.formatAmount(mainAssetBalance.balance, mainAssetBalance.decimals))
            elem.find(".ticker").html(mainAssetBalance.ticker)

            elem.attr("data-addressId", i)
            elem.find(".balance").attr("data-accountMainBalance", address)

            if(data.selectedAddress == i){
                SettingsPane.accountSelectionHeaderSvg.attr("data-jdenticon-value", address)
                elem.addClass("selected")
            }

            elem.click(function(){
                if(elem.hasClass("selected")) return

                changeAccount(elem.attr("data-addressId")).then(function(){
                    $("#settings .accounts .account.selected").removeClass("selected")
                    elem.addClass("selected")
                    SettingsPane.accountSelectionHeader.click()
                    SettingsPane.accountSelectionHeaderSvg.attr("data-jdenticon-value", address)
                    jdenticon()
                })
            })

            SettingsPane.accounts.append(elem)
            elem.show()
            i++
        }
        jdenticon()
    }


}

const settingsPane = new SettingsPane()
