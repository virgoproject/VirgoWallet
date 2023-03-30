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
        words: $("#settings .getMnemonic .writeMnemonic .word"),
        additionalWords : $('#settings .getMnemonic .writeMnemonic .additionalLength')
    }
    static importMnemonic = {
        self: $("#settings .importMnemonic"),
        warn: $("#settings .importMnemonic .mnemonicWarn"),
        warnBtn: $("#settings .importMnemonic .mnemonicWarn button"),
        ask: $("#settings .importMnemonic .mnemonicAsk"),
        askText: $("#settings .importMnemonic .mnemonicAsk textarea"),
        askBtn: $("#settings .importMnemonic .mnemonicAsk #grantAccess"),
        importBtn : $("#settings .importMnemonic .mnemonicAsk #importPhrase"),
        askInput: $("#settings .importMnemonic .mnemonicAsk input"),
        showWords : $('#settings .importMnemonic .fa-eye'),
        hideWords : $('#settings .importMnemonic .fa-eye-slash'),
        inputWords : $('#settings .importMnemonic .lengtInput'),
        selectPhrase : $('#settings .importMnemonic #phraseLength'),
        shortWords : $('#settings .importMnemonic #12-length'),
        longWords : $('#settings .importMnemonic #24-length'),
        importFileInput : $("#settings .importMnemonic #importPhraseInput"),
        label: {
            err: $("#settings .importMnemonic .mnemonicAsk .label.error"),
            normal: $("#settings .importMnemonic .mnemonicAsk .label.normal")
        }
    }
    static autolock = {
        enabled: $("#autolockEnabledSetting"),
        delay: $("#autolockDelaySetting")
    }

    constructor() {

        let mainSettingsBackLevel = 0;


        events.addListener("addressesChanged", data => {
            const baseElem = $("#baseAccountRow").clone()
            SettingsPane.accounts.html("")
            SettingsPane.accounts.append(baseElem)

            settingsPane.setSettings(data)
        })

        SettingsPane.addAccountBtn.click(function(){
            addAccount()
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
            for(let i = mainSettingsBackLevel; i >= 0; i--){
                SettingsPane.settingsBackBtn.click()
            }

            //close transaction pane
            if(TransactionsPane.self.is(":visible"))
                TransactionsPane.back.click()
        })

        SettingsPane.openSettingsBtn.click(function(){
            SettingsPane.main.hide()
            SettingsPane.settingsMain.show()
            SettingsPane.settingsTitle.html("Settings")
        })

        SettingsPane.settingsBackBtn.click(async function(){
            const res = await getBaseInfos()
            if (!res.setupDone){
                CreatePane.self.show()
                SettingsPane.accountSelectionHeader.show()
                SettingsPane.settings.removeClass("opened")
                SettingsPane.accountSelectionHeader.removeClass("opened")
                SettingsPane.settings.removeClass("walletSetup")
                SettingsPane.settingsMain.hide()
                SettingsPane.importMnemonic.self.hide()
            }else{
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
            }
        })

        $("#settings .settingsPane .tab").click(function(){
            const target = $("[data-settingId="+$(this).attr("data-target")+"]")

            if(target.attr("data-title"))
                SettingsPane.settingsTitle.html(target.attr("data-title"))

            target.show()

            mainSettingsBackLevel = target.attr("data-settingsLevel")
        })

        SettingsPane.openSupportBtn.click(function(){
            browser.windows.create({
                url: "https://virgo.net/support"
            })
        })

        getAutolock().then(function(res){
            SettingsPane.autolock.enabled.prop("checked", res.enabled)
            SettingsPane.autolock.delay.val(res.delay)
        })

        SettingsPane.autolock.enabled.change(function() {
            setAutolock($(this).is(':checked'), parseInt(SettingsPane.autolock.delay.val()))
        })

        SettingsPane.autolock.delay.change(function(){
            setAutolock(SettingsPane.autolock.enabled.is(':checked'), parseInt($(this).val()))
        })
    }

    setSettings(data){
        let i = 0;
        for(const addressObj of data.addresses){
            const address = addressObj.address
            const name = addressObj.name

            const elem = SettingsPane.baseAccountRow.clone()
            elem.find("svg").attr("data-jdenticon-value", address)
            elem.find(".address").val(name)
            elem.find(".address").click(function (e){
                e.stopPropagation()
            })
            elem.find(".address").change(function (e){
                changeAccountName(address,e.target.value)
            }).on("input", function(){
                $(this).css("width", ($(this).val().length+2) + "ch")
            }).trigger("input")

            elem.find(".editIcon").click(e => {
                elem.find(".address").focus()
                e.stopPropagation()
            })

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

    assembleMnemonic(){
        let phraseSeed = ""
        for(let i = 0; i < SettingsPane.importMnemonic.inputWords.length; i++){
            const inputVal = SettingsPane.importMnemonic.inputWords[i].value
            if(inputVal !== ""){
                phraseSeed = phraseSeed +inputVal+ " "
            }
        }
        return phraseSeed.substring(0, phraseSeed.length - 1);
    }

    verifyMnemonic(){
        if (SettingsPane.importMnemonic.selectPhrase.find(":selected").val() === "12"){
            SettingsPane.importMnemonic.askBtn.prop("disabled", settingsPane.assembleMnemonic().split(" ").length < 12);
        }else {
            SettingsPane.importMnemonic.askBtn.prop("disabled", settingsPane.assembleMnemonic().split(" ").length < 24);
        }
    }
}

const settingsPane = new SettingsPane()
