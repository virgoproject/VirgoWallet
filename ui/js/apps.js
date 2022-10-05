class appsPane {


    constructor() {

        $('.appElement').click(function (e) {
            const appSwitch = $(this).attr('data-app')
            console.log(appSwitch)

            switch (appSwitch) {
                case 'virgo-farm':
                    VirgoFarm.launch()
                    break;
            }
        })
    }
}

const appsPans = new appsPane()
