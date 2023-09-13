class TutorialPane {

    static boxTutorial = {
        tutorialPopup : $('#tutorialPopup'),
        box : $('#tutorialPopup .box'),
        closeBox : $('#tutorialPopup #closeTutorial'),
        steps1 : $('#tutorialPopup #tutoStep1'),
        steps2 : $('#tutorialPopup #tutoStep2'),
        steps3 : $('#tutorialPopup #tutoStep3'),
        tutorialPic : $('#tutorialPopup #imgTutorial'),
        tutorialTitle : $('#tutorialPopup #tutorialTitle'),
        tutorialCenteredText : $('#tutorialPopup #tutorialCenteredText'),
        tutorialBottomText : $('#tutorialPopup #tutorialBottomText'),
        tutorialBtn : $('#tutorialPopup #tutorialButton'),
        chainSelection : $('#chainSelectionHeader'),
        accountSelection : $('#accountSelectionHeader'),
        pendingTxs : $('.header .pendingTxs')
    }

    constructor() {
        let activeSteps = 0

        // tutorialPane.boxTutorial.chainSelection.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
        // tutorialPane.boxTutorial.chainSelection.attr('disabled',"disabled");


        TutorialPane.boxTutorial.tutorialBtn.click( (e) => {

            switch (activeSteps){
                case 0:
                    TutorialPane.boxTutorial.chainSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
                    TutorialPane.boxTutorial.accountSelection.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
                    TutorialPane.boxTutorial.tutorialPic.attr("src", "../images/tutorial/settings.png");
                    TutorialPane.boxTutorial.steps2.addClass('stepsActive')
                    TutorialPane.boxTutorial.tutorialTitle.text('Access to your account settings')
                    TutorialPane.boxTutorial.tutorialCenteredText.text('Manage your security settings,create and switch between accounts and much more.')
                    TutorialPane.boxTutorial.tutorialBottomText.text('')
                    activeSteps = 1
                    break;
                case 1:
                    TutorialPane.boxTutorial.tutorialPic.attr("src", "../images/tutorial/assets.png");
                    TutorialPane.boxTutorial.steps3.addClass('stepsActive')
                    TutorialPane.boxTutorial.tutorialTitle.text('View your activity history')
                    TutorialPane.boxTutorial.tutorialCenteredText.text('Keep an eye on your wallet activity, down to the last detail.')
                    TutorialPane.boxTutorial.tutorialBottomText.text("You won't miss anything.")
                    TutorialPane.boxTutorial.accountSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
                    TutorialPane.boxTutorial.pendingTxs.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
                    activeSteps = 2

                    break;
                case 2:
                    TutorialPane.boxTutorial.tutorialPopup.css('display','none')
                    TutorialPane.boxTutorial.pendingTxs.css({'position' : '','z-index' : '','pointer-events' : ''})
                    setTutorialDone()
                    break;
            }


        })

        TutorialPane.boxTutorial.closeBox.click((e) => {
            TutorialPane.boxTutorial.tutorialPopup.css('display','none')
            TutorialPane.boxTutorial.accountSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
            TutorialPane.boxTutorial.pendingTxs.css({'position' : '','z-index' : '','pointer-events' : ''})
            TutorialPane.boxTutorial.chainSelection.css({'position' : '','z-index' : '','pointer-events' : ''})
            setTutorialDone()

        })

    }

    checkDisplay() {
        isTutorialDone().then(res => {
            if (res) {
                return
            }else {
                TutorialPane.boxTutorial.tutorialPopup.css('display','block')
                TutorialPane.boxTutorial.chainSelection.css({'position' : 'relative','z-index' : '1000','pointer-events' : 'none'})
            }
        })
    }

}

const tutorialPane = new TutorialPane()
