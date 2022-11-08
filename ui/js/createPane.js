class CreatePane {

    static self = $("#createPane")

    static buttons = {
        createWallet : $('#createWallet'),
        importWallet : $('#importWallet')
    }

    constructor() {

        CreatePane.buttons.createWallet.click(async function () {
            CreatePane.self.hide()
            MainPane.self.show()
            SettingsPane.settings.removeClass('opened')
            setupDone()
        })

        CreatePane.buttons.importWallet.click(function () {
            SettingsPane.settings.addClass("walletSetup")
            CreatePane.self.hide()
            SettingsPane.accountSelectionHeader.hide()
            SettingsPane.settings.addClass("opened")
            SettingsPane.accountSelectionHeader.addClass("opened")
            SettingsPane.settingsMain.show()
            SettingsPane.importMnemonic.self.show()
        })
    }
}

const createPane = new CreatePane()
