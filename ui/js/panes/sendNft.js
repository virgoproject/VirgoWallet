class SendNft {
    static nftSendBack = $('#nftSendPane .back')
    static nftSendPane = $("#nftSendPane")
    static confirmRecipient = $("#sendNFTConfirmRecipient")
    static nftSendConfirm = $("#sendNFTConfirmPane")
    static nftImageSend = $('#sendNFTConfirmPane .logoNft')
    static confirmName = $("#sendNFTConfirmName")
    static recipient = $("#sendNFTRecipient")
    static recipientBtn = $("#sendNFTRecipientBtn")
    static recipientPane = $("#sendNFTRecipientPane")

    static loadingPane = $("#sendNFTLoadingPane")

    constructor() {
        SendNft.nftSendBack.click(function (){
            SendNft.nftSendPane.hide()
            SendNft.nftSendConfirm.hide()
            SendNft.nftImageSend.attr("src", "");
            SendNft.confirmRecipient.html("")
        })

        SendNft.recipient.on("input", function(){
            const input = $(this);
            if(input.val().length < 42){
                SendNft.recipientBtn.attr("disabled", true)
                return
            }
            validateAddress(input.val()).then(function(res){
                SendNft.recipientBtn.attr("disabled", !res)
            })
        })
    }

    init(uri, tokenId, address){
        SendNft.recipient.val("")
        SendNft.recipientBtn.attr("disabled", true)

        SendNft.recipientBtn.click(function (){
            SendNft.recipientPane.hide()
            let recipient = SendNft.recipient.val()
            SendNft.displayConfirm(uri, recipient, tokenId, address)
        })
    }

    static displayConfirm(uri, recipient, tokenId, address){
        SendNft.loadingPane.show()
        fetch(uri).then(resp => {
            resp.json().then(json => {
                SendNft.nftImageSend.attr("src", json.image);
                SendNft.confirmName.html(json.name)
                SendNft.confirmRecipient.html(recipient)
                document.getElementById("sendNFTRecipientIcon").setAttribute("data-jdenticon-value",recipient)

                estimateSendFeesNft(recipient, tokenId, address)
                    .then(function (fees){
                        let editFees = document.querySelector("edit-fees");

                        editFees.onGasChanged = (gasPrice, gasLimit) => {

                            getBalance(MAIN_ASSET.ticker).then(function (mainBal) {
                                let totalNative = Number(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))

                                if (MAIN_ASSET.ticker == SendPane.select.val())
                                    totalNative += Number(SendPane.amount.val())

                                if (totalNative <= Utils.formatAmount(mainBal.balance, mainBal.decimals)) {
                                    $("#confirmSendNftBtn").find("val").html("Send NFT")
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

                        SendNft.loadingPane.hide()
                        SendNft.nftSendConfirm.show()

                        console.log("heyy")

                        $("#confirmSendNftBtn").click(function(){
                            disableLoadBtn($("#confirmSendNftBtn"))
                            sendToNft(recipient,
                                address,
                                tokenId,
                                fees.gasLimit,
                                fees.gasPrice)
                                .then(function(res){
                                    enableLoadBtn($("#confirmSendNftBtn"))
                                    notyf.success("Transaction sent!")
                                    removeNft(address, tokenId)
                                    $("#allAssets").addClass("divResumePaneSelected")
                                    $("#nft").removeClass("divResumePaneSelected")
                                    $("#walletNft").hide()
                                    $("#walletAssets").show()
                                    $(".importNft").removeClass("importNftSelected")
                                    $('.addAsset').show()
                                    $(".sendPaneNft .recipient").val("")
                                    $(".nextBtn").attr("disabled", true)
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
