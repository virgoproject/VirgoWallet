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
    static openSettingsBtn = $("#openSettingsBtn")

    constructor() {
        let mainSettingsBackLevel = 0;
        let lastSettingsTitle = "";

        events.addListener("addressesChanged", data => {
            const baseElem = $("#baseAccountRow").clone()
            SettingsPane.accounts.html("")
            SettingsPane.accounts.append(baseElem)

            settingsPane.setSettings(data)
        })
        SettingsPane.addAccountBtn.click(function(){
            addAccount().then(function(data){
                const baseElem = $("#baseAccountRow").clone()
                SettingsPane.accounts.html("")
                SettingsPane.accounts.append(baseElem)
                settingsPane.setSettings(data)
            })
        })

        SettingsPane.accountSelectionHeader.click(function(e){
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
            const elem = document.createElement("settings-menu")
            document.body.appendChild(elem)
            /**SettingsPane.main.hide()
            hideStatsBar()
            SettingsPane.settingsMain.show()
            SettingsPane.settingsTitle.html("Settings")
            **/
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
                    document.getElementById("resumeTokenBar").innerHTML = ""
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
