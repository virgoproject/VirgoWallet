class SendNft {
    static nftSendBtn = $("#sendNftBtn")
    static nftSendBack = $('#nftSendPane .back')
    static nftSendPane = $("#nftSendPane")
    static nftSendPaneRecipient = $(".sendConfirm .value")
    static nftSendConfirm = $("#sendNftConfirmFees")
    static nextStep = $(".nextBtn")
    static nftImageSend = $('#sendNftConfirmFees .logoNft')


    constructor() {
        SendNft.nftSendBack.click(function (){
            SendNft.nftSendPane.hide()
            SendNft.nftSendConfirm.hide()
        })
    }

    displayInfo(uri ,recipient ,tokenId){
        console.log(uri)
        fetch(uri).then(resp => {
            resp.json().then(json => {
                SendNft.nftImageSend.attr("src", json.image);
                console.log(recipient)
                SendNft.nftSendPaneRecipient.find("val").html(recipient)
                document.getElementById("to").setAttribute("data-jdenticon-value",recipient)

                estimateSendFeesNft(recipient, tokenId)
                    .then(function (fees){
                        console.log(fees)
                    })
            });
        });
    }

}

const sendNft = new SendNft()
