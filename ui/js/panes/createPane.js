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
            setSetupDone()
            tutorialPane.checkDisplay()
        })

        CreatePane.buttons.importWallet.click(function () {
            const elem = document.createElement("settings-import-mnemonic")
            document.body.appendChild(elem)
        })
    }
}

const createPane = new CreatePane()
