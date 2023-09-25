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


    }

    displayInfo(uri){
        console.log(uri)
    }

}

const sendNft = new SendNft()
