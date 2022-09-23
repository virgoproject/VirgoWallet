class appsPane {

    static div = {
        virgoFarmApp: $("#virgoFarm")
    }

    static buttons = {
        appsBtn: $('#body .store .appElement'),
        goBackFarm: $('#virgoFarm .back')
    }

    static alert = {
        appPopup: $('#appPopup')
    }

    static text = {
        appsTitle: $('#appPopup .appPPTitle h3'),
        appsFeatures: $('#appPopup .appPPFeatures'),
        appsDesc: $('#appPopup .appPPTDesc'),
        appText1: $('#appPopup .appPPText1'),
        appText2: $('#appPopup .appPPText2'),
        appText3: $('#appPopup .appPPText3'),
        appText4: $('#appPopup .appPPText4')
    }

    constructor() {

        $('.appElement').click(function (e) {
            const appSwitch = $(this).attr('data-app')

            switch (appSwitch) {
                case 'virgo-farm':
                    appsPane.virgofarm()
                    break;

            }
        })
    }

    static virgofarm() {
        let officialApp = true
        appsPane.alert.appPopup.show()
        appsPane.div.virgoFarmApp.show()
        getBaseInfos().then(function (infos) {
            console.log(infos.addresses[0].address)
        })

        appsPane.buttons.goBackFarm.click(function () {
            appsPane.div.virgoFarmApp.hide()
        })

        if (officialApp) {
            appsPane.text.appsTitle.html('Virgo Farm <i class="fa-solid fa-badge-check" style="color: var(--mainColor)"></i>')
        } else {
            appsPane.text.appsTitle.html('Virgo Farm')
        }

        appsPane.text.appsFeatures.html("What's Virgo Farm ?")
        appsPane.text.appsDesc.html("Version 1.0")
        appsPane.text.appText1.html('<b>Stake your VGOs, earn rewards</b>, virgoFarm is the application enabling you to stake your VGOs.')
        appsPane.text.appText2.html('<b>Earn while you sleep</b>, up to <b>36.4% APY</b>')
        appsPane.text.appText3.hide()
        appsPane.text.appText4.hide()

    }
}

const appsPans = new appsPane()
