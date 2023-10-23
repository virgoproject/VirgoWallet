class NftDetailPane {
    static self = $("#nftDetailPane")
    static back = $("#nftDetailPane .back")
    static loading = $("#nftDetailsPaneLoading")
    static nftSendBtn = $("#sendNftBtn")
    static nftSendPane = $("#nftSendPane")
    static sendPaneNft = $('.sendPaneNft')
    static nftSendPaneRecipient = $(".sendPaneNft .recipient")
    static nftSendConfirm = $("#sendNftConfirmFees")
    static nextStep = $(".nextBtn")
    static detailedPane = {
        self: $("#nftDetailsDetailed"),
        name: $("#nftDetailPane .name"),
        img: $("#nftDetailPane .logoNft"),
        infos: $("#nftInfos"),
        infosLoading: $("#nftInfosLoading"),
        infosWrapper: $("#nftInfosWrapper"),
        infosWrapperStats: $("#nftInfosWrapper .stats"),
        infosWrapperDesc: $("#nftInfosWrapper .description"),
        baseAttrNft: $("#nftInfosWrapper .baseAttrNft"),
        baseAttrNftTitle: $("#baseAttrNft .attrTitle"),
        baseAttrNftSpec: $("#baseAttrNft .attrSpec"),
        addrSpec: $("#nftInfosWrapper .AddrNft .AddrSpec"),
        tokenIdSpec: $("#nftInfosWrapper  .tokenIdNft .tokenIdSpec"),
        copyAddr: $("#nftInfosWrapper  .AddrNft .addrCopy"),
        copyTokenId: $("#nftInfosWrapper  .tokenIdNft .tokenIdCopy"),
    }

    constructor() {
    NftDetailPane.back.click(function(){
        NftDetailPane.self.hide()
        NftDetailPane.detailedPane.infosWrapperStats.empty()
    })

        NftDetailPane.nftSendPaneRecipient.on("input", function(){
            const input = $(this);
            if(input.val().length < 42){
                NftDetailPane.nextStep.attr("disabled", true)
                return
            }
            validateAddress(input.val()).then(function(res){
                NftDetailPane.nextStep.attr("disabled", !res)
            })
        })
    }

    displayToken(uri,address,tokenId){
        NftDetailPane.self.show()
        NftDetailPane.loading.show()
        NftDetailPane.detailedPane.self.hide()
        NftDetailPane.detailedPane.infos.hide()
        NftDetailPane.detailedPane.infosLoading.hide()
        NftDetailPane.detailedPane.infosWrapper.hide()
        NftDetailPane.detailedPane.addrSpec.html(address)
        NftDetailPane.detailedPane.tokenIdSpec.html(tokenId)

        NftDetailPane.detailedPane.copyAddr.click(function(e){
            e.stopPropagation()
            copyToClipboard(address);
        })

        NftDetailPane.detailedPane.copyTokenId.click(function(e){
            e.stopPropagation()
            copyToClipboard(tokenId);
        })

        NftDetailPane.nftSendBtn.click(function (){
            NftDetailPane.nftSendPane.show()
            NftDetailPane.sendPaneNft.show()
        })

        NftDetailPane.nextStep.click(function (){
            NftDetailPane.sendPaneNft.hide()
            NftDetailPane.nftSendConfirm.show()
            let recipient = NftDetailPane.nftSendPaneRecipient.val()
            sendNft.displayInfo(uri ,recipient ,tokenId, address,)
        })

        fetch(uri).then(resp => {
            resp.json().then(json => {
                console.log(json)
                NftDetailPane.detailedPane.name.html(json.name)
                NftDetailPane.detailedPane.img.attr("src", json.image);
                NftDetailPane.detailedPane.infosWrapperDesc.html(json.description)
                if (json.attributes && Array.isArray(json.attributes)) {
                    for (let x = 0; x < json.attributes.length; x++) {
                        let newSpec = NftDetailPane.detailedPane.baseAttrNft.clone();
                        console.log(newSpec)
                        if ("trait_type" in json.attributes[x]) {
                            let title = json.attributes[x].trait_type;
                            console.log(title)
                            newSpec.find(".attrTitle").html(title);
                        }

                        if ("value" in json.attributes[x]) {
                            let value = json.attributes[x].value;
                            console.log(value)
                            newSpec.find(".attrSpec").html(value);
                        }


                        NftDetailPane.detailedPane.infosWrapperStats.append(newSpec)
                        newSpec.show()
                        NftDetailPane.self.show()
                        NftDetailPane.loading.hide()
                        NftDetailPane.detailedPane.self.show()
                        NftDetailPane.detailedPane.infos.show()
                        NftDetailPane.detailedPane.infosLoading.hide()
                        NftDetailPane.detailedPane.infosWrapper.show()
                    }
                }
            });
        });
    }

}
const nftDetailPane = new NftDetailPane()
