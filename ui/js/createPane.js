class createPane{

    static div = {
        createPane : $('#createPane'),
        mainPane : $('#mainPane'),
        settingsMain : $('#settings'),
        settingsPane : $('#settings .settingsPane'),
        settingsPaneMemonic : $('#settings .settingsPane .importMnemonic')
    }

    static Buttons = {
        createWallet : $('#createPane #createWallet'),
        importWallet : $('#createPane #importWallet'),
        settingsBackBtn : $('#settings .settingsPane .back'),
        settingsSelectionBtn : $('#accountSelectionHeader'),
        backToCreate : $('#settings .settingsPane .importMnemonic .backToCreate')
    }

    constructor() {

        createPane.Buttons.createWallet.click(function () {
            createPane.div.createPane.hide()
            createPane.div.mainPane.show()
            createPane.div.settingsMain.removeClass('opened')

        })

        createPane.Buttons.importWallet.click(function () {
            createPane.div.settingsMain.css({'transform': 'scaleY(1)', 'transition': 'unset'})
            createPane.div.createPane.hide()
            createPane.Buttons.settingsBackBtn.hide()
            createPane.Buttons.settingsSelectionBtn.hide()
            createPane.div.settingsPane.show()
            createPane.div.settingsPaneMemonic.show()

        })

        createPane.Buttons.backToCreate.click(function () {
            createPane.div.createPane.show()
            createPane.Buttons.settingsBackBtn.show()
            createPane.Buttons.settingsSelectionBtn.show()
            createPane.div.settingsMain.css({'transform': '', 'transition': ''})
            createPane.Buttons.backToCreate.hide()
            createPane.div.settingsPane.hide()
            createPane.div.settingsPaneMemonic.hide()
        })
    }
}

const CreatePane = new createPane()