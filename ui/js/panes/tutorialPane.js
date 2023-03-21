class tutorialPane{

    static boxTutorial = {
        tutorialPopup : $('#tutorialPopup'),
        box : $('#tutorialPopup .box'),
        closeBox : $('#tutorialPopup #closeTutorial'),
        steps1 : $('#tutorialPopup #tutoStep1'),
        steps2 : $('#tutorialPopup #tutoStep2'),
        steps3 : $('#tutorialPopup #tutoStep3'),
        tutorialPic : $('#tutorialPopup #imgTutorial'),
        tutorialTittle : $('#tutorialPopup #tutorialTitle'),
        tutorialCenteredText : $('#tutorialPopup #tutorialCenteredText'),
        tutorialBottomText : $('#tutorialPopup #tutorialBottomText'),
        tutorialBtn : $('#tutorialPopup #tutorialButton'),
        chainSelection : $('#chainSelectionHeader'),
        accountSelection : $('#accountSelectionHeader'),
        pendingTxs : $('.header .pendingTxs')
    }

    constructor() {
        let activeSteps = 0

        tutorialDone().then(res => {
            if (res) {
                return
            }else {
                tutorialPane.boxTutorial.tutorialPopup.css('display','block')
            }
        })

        tutorialPane.boxTutorial.chainSelection.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
        tutorialPane.boxTutorial.chainSelection.attr('disabled',"disabled");


        tutorialPane.boxTutorial.tutorialBtn.click( (e) => {

            switch (activeSteps){
                case 0:
                    tutorialPane.boxTutorial.chainSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
                    tutorialPane.boxTutorial.accountSelection.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
                    tutorialPane.boxTutorial.tutorialPic.attr("src", "../images/tutorialSetup.png");
                    tutorialPane.boxTutorial.steps2.addClass('stepsActive')
                    tutorialPane.boxTutorial.tutorialTittle.text('Access to your account settings')
                    tutorialPane.boxTutorial.tutorialCenteredText.text('Manage your security settings,create and switch accounts and much more.')
                    tutorialPane.boxTutorial.tutorialBottomText.text('You will find our support to contact us in case of problems.')
                    tutorialPane.boxTutorial.tutorialBtn.text('Continue')
                    activeSteps = 1
                    break;
                case 1:
                    tutorialPane.boxTutorial.tutorialPic.attr("src", "../images/tutorialAssetsFinal.png");
                    tutorialPane.boxTutorial.steps3.addClass('stepsActive')
                    tutorialPane.boxTutorial.tutorialTittle.text('View your transaction and swap history')
                    tutorialPane.boxTutorial.tutorialCenteredText.text('Watch all your activities in the Wallet, down to the last detail.')
                    tutorialPane.boxTutorial.tutorialBottomText.text("You won't miss anything.")
                    tutorialPane.boxTutorial.tutorialBtn.text('I discover Virgo Wallet')
                    tutorialPane.boxTutorial.accountSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
                    tutorialPane.boxTutorial.pendingTxs.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
                    activeSteps = 2

                    break;
                case 2:
                    tutorialPane.boxTutorial.tutorialPopup.css('display','none')
                    tutorialPane.boxTutorial.pendingTxs.css({'position' : '','z-index' : '','pointer-events' : ''})
                    tutorialDone()
                    break;
            }


        })

        tutorialPane.boxTutorial.closeBox.click((e) => {
            tutorialPane.boxTutorial.tutorialPopup.css('display','none')
            tutorialPane.boxTutorial.accountSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
            tutorialPane.boxTutorial.pendingTxs.css({'position' : '','z-index' : '','pointer-events' : ''})
            tutorialPane.boxTutorial.chainSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
            tutorialDone()

        })

    }

}

const TutorialPane = new tutorialPane()