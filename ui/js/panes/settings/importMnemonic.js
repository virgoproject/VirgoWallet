class ImportMnemonic{

    constructor() {

        /** -- Restore from mnemonic -- **/
        $("#settings .settingsPane .tab[data-target=importMnemonic]").click(function(){
            //reset forms
            SettingsPane.importMnemonic.warn.hide()
            SettingsPane.importMnemonic.ask.show()

            SettingsPane.importMnemonic.inputWords.val("")
            SettingsPane.importMnemonic.askBtn.attr("disabled", true)
            SettingsPane.importMnemonic.askInput.attr("disabled", false)
        })

        SettingsPane.importMnemonic.inputWords.on("input", function(){
            settingsPane.verifyMnemonic()
        });

        SettingsPane.importMnemonic.inputWords.click(function(){
            $(this).removeClass("is-invalid")
            SettingsPane.importMnemonic.label.err.hide()
            SettingsPane.importMnemonic.label.normal.show()
        });

        SettingsPane.importMnemonic.showWords.click(function () {
            $(this).hide()
            SettingsPane.importMnemonic.hideWords.show()
            SettingsPane.importMnemonic.inputWords.each(function(i, obj) {
                obj.type = 'password'
            })
        })

        SettingsPane.importMnemonic.hideWords.click(function () {
            $(this).hide()
            SettingsPane.importMnemonic.showWords.show()
            SettingsPane.importMnemonic.inputWords.each(function(i, obj) {
                obj.type = 'text'
            })

        })

        SettingsPane.importMnemonic.importBtn.click(function () {
            SettingsPane.importMnemonic.importFileInput.trigger('click')
        })

        SettingsPane.importMnemonic.selectPhrase.on('change', function() {
            const length = $(this).find(":selected").val()
            if (Number(length) === 12){
                SettingsPane.importMnemonic.shortWords.removeClass('d-none').addClass('d-flex')
                SettingsPane.importMnemonic.longWords.removeClass('d-flex').addClass('d-none')
            }
            if (Number(length) === 24){
                SettingsPane.importMnemonic.shortWords.removeClass('d-flex').addClass('d-none')
                SettingsPane.importMnemonic.longWords.removeClass('d-none').addClass('d-flex')
            }
            SettingsPane.importMnemonic.inputWords.val("")
            settingsPane.verifyMnemonic()
        });

        SettingsPane.importMnemonic.inputWords.on('paste', function (e) {
            e.preventDefault()
            let paste = e.originalEvent.clipboardData.getData('text')
            let selectedVal = SettingsPane.importMnemonic.selectPhrase.find(':selected').val()

            let data = paste.replace(/\n/g, " ").split(" ")
            data = data.filter(el => el.trim());
            let parsingData = ""

            if (!data.length < 12) {

                for (let i = 0; SettingsPane.importMnemonic.inputWords.length > i; i++) {
                    if (Number(selectedVal) === 12) parsingData = [i]
                    if (Number(selectedVal) === 24) parsingData = [i + 12]
                    const node = SettingsPane.importMnemonic.inputWords[parsingData]
                    if (data[i] === undefined) break
                    node.value = data[i]
                    settingsPane.verifyMnemonic()
                }
            }
        })

        SettingsPane.importMnemonic.askBtn.click(function(){
            disableLoadBtn($(this))
            isMnemonicValid(settingsPane.assembleMnemonic()).then(function(response){
                enableLoadBtn(SettingsPane.importMnemonic.askBtn)
                SettingsPane.importMnemonic.askBtn.attr("disabled", true)
                if(!response){
                    SettingsPane.importMnemonic.label.normal.hide()
                    SettingsPane.importMnemonic.label.err.show()
                    SettingsPane.importMnemonic.inputWords.addClass("is-invalid")

                    setTimeout(function (){
                        if(SettingsPane.importMnemonic.label.normal.is(":hidden")){
                            SettingsPane.importMnemonic.inputWords.removeClass("is-invalid")
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
            restoreFromMnemonic(settingsPane.assembleMnemonic()).then(function(res){
                setTimeout(function(){
                    getBaseInfos().then(data => {
                        //in case of initial setup
                        SettingsPane.accountSelectionHeader.show()
                        SettingsPane.settings.removeClass("walletSetup")
                        SettingsPane.settingsMain.hide()
                        SettingsPane.importMnemonic.self.hide()
                        if(data.backupPopup)
                            MainPane.backupPopup.self.show()
                        //chain selection
                        selectChains.setChains(data)
                        //settings
                        let elem = SettingsPane.baseAccountRow.clone()
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
                    })
                }, 2000)
            })
        })
    }

}

const importMnemonic = new ImportMnemonic()