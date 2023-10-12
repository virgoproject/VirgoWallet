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
            SendNft.nftImageSend.attr("src", "");
            SendNft.nftSendPaneRecipient.find("val").html("")
        })
    }

    displayInfo(uri ,recipient ,tokenId, addres){
        console.log(uri)
        $("#sendNftConfirmFees").hide()
        $(".loadingNft").show()
        fetch(uri).then(resp => {
            resp.json().then(json => {
                SendNft.nftImageSend.attr("src", json.image);
                console.log(recipient)
                SendNft.nftSendPaneRecipient.find("val").html(recipient)
                document.getElementById("to").setAttribute("data-jdenticon-value",recipient)

                estimateSendFeesNft(recipient, tokenId, addres)
                    .then(function (fees){
                        console.log(fees)
                        let editFees = document.querySelector("edit-fees");

                        editFees.onGasChanged = (gasPrice, gasLimit) => {

                            getBalance(MAIN_ASSET.ticker).then(function (mainBal) {
                                let totalNative = Number(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))

                                if (MAIN_ASSET.ticker == SendPane.select.val())
                                    totalNative += Number(SendPane.amount.val())

                                if (totalNative <= Utils.formatAmount(mainBal.balance, mainBal.decimals)) {
                                    $("#confirmSendNftBtn").find("val").html("Send " + MAIN_ASSET.ticker)
                                    $("#confirmSendNftBtn").attr("disabled", false)
                                } else {
                                    $("#confirmSendNftBtn").find("val").html("Insufficient " + MAIN_ASSET.ticker + " balance")
                                    $("#confirmSendNftBtn").attr("disabled", true)
                                }

                                $("#sendNftReviewNetFees").html(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))
                                $("#sendNftReviewCost").html(totalNative)
                                $("#sendNftReviewCostTicker").html(MAIN_ASSET.ticker)
                            })

                        }
                        editFees.start(fees.gasLimit);
                        editFees.onGasChanged(fees.gasPrice, fees.gasLimit)

                        $(".loadingNft").hide()
                        $("#sendNftConfirmFees").show()

                        $("#confirmSendNftBtn").click(function(){
                            console.log("coucou")
                            sendToNft(recipient,
                                addres,
                                tokenId,
                                fees.gasLimit,
                                fees.gasPrice)
                                .then(function(res){
                                    notyf.success("Transaction sent!")
                                    removeNft(addres, tokenId)
                                    $("#allAssets").addClass("divResumePaneSelected")
                                    $("#nft").removeClass("divResumePaneSelected")
                                    $("#walletNft").hide()
                                    $("#walletAssets").show()
                                    $(".importNft").removeClass("importNftSelected")
                                    $('.addAsset').show()
                                    SendNft.nftSendPane.hide()
                                    SendNft.nftSendConfirm.hide()
                                    $("#nftDetailPane").hide()
                                    $("#collectionPane").hide()
                           })

                        })
                    })
            });
        });
    }

}

const sendNft = new SendNft()
