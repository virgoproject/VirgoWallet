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
        settingsSelectionBtn : $('#accountSelectionHeader')
    }

    constructor() {

        createPane.Buttons.createWallet.click(async function () {
            createPane.div.createPane.hide()
            createPane.div.mainPane.show()
            createPane.div.settingsMain.removeClass('opened')
            setupDone().then(function (res) {
                  console.log(res)
              })
        })

        createPane.Buttons.importWallet.click(function () {
            createPane.div.settingsMain.css({'transform': 'scaleY(1)', 'transition': 'unset'})
            createPane.div.createPane.hide()
            createPane.Buttons.settingsSelectionBtn.hide()
            createPane.div.settingsPane.show()
            createPane.div.settingsPaneMemonic.show()

        })
    }
}

const CreatePane = new createPane()