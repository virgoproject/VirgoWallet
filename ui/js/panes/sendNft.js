class SendNft {
    static nftSendBtn = $("#sendNftBtn")
    static nftSendBack = $('#nftSendPane .back')
    static nftSendPane = $("#nftSendPane")
    static nftSendPaneRecipient = $(".sendPaneNft")
    static nftSendConfirm = $("#sendNftConfirmFees")
    static nextStep = $(".nextBtn")


    constructor() {
        SendNft.nftSendBack.click(function (){
            SendNft.nftSendPane.hide()
        })

        SendNft.nftSendBtn.click(function (){
            SendNft.nftSendPane.show()
            SendNft.nftSendPaneRecipient.show()
        })

        SendNft.nextStep.click(function (){
            SendNft.nftSendPaneRecipient.hide()
            SendNft.nftSendConfirm.show()
        })


    }

}

const sendNft = new SendNft()
