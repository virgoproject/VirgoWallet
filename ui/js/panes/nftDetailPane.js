class NftDetailPane {
    static self = $("#nftDetailPane")
    static back = $("#nftDetailPane .back")
    static loading = $("#nftDetailsPaneLoading")
    static nftSendBtn = $("#sendNftBtn")
    static nftSendPane = $("#nftSendPane")
    static sendPaneNft = $('.sendPaneNft')
    static deleteNft = $('.deleteNft')
    static deleteNftConfirm = $("#deleteNftButtonConfirm")
    static deleteNftCancel = $("#deleteNftButtonCancel")
    static deleteNftBack = $("#closeNftDelete")
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

            NftDetailPane.detailedPane.addrSpec.html("Copied!")

            setTimeout(function(){
                NftDetailPane.detailedPane.addrSpec.html(address)
            }, 2500)
        })

        NftDetailPane.detailedPane.copyTokenId.click(function(e){
            e.stopPropagation()
            copyToClipboard(tokenId);

            NftDetailPane.detailedPane.tokenIdSpec.html("Copied!")

            setTimeout(function(){
                NftDetailPane.detailedPane.tokenIdSpec.html(tokenId)
            }, 2500)
        })

        NftDetailPane.deleteNft.click(function (){
            $('#deleteNftPopup').show()
        })

        NftDetailPane.deleteNftBack.click(function (){
            $('#deleteNftPopup').hide()
        })

        NftDetailPane.deleteNftConfirm.click(function (){
            removeNft(address, tokenId)
            NftDetailPane.deleteNftBack.click()
            $("#nftDetailPane").hide()
            $("#collectionPane").hide()
            $("#allAssets").click()
            notyf.success("NFT successfully deleted!")
        })

        NftDetailPane.deleteNftCancel.click(function (){
            NftDetailPane.deleteNftBack.click()
        })

        NftDetailPane.nftSendBtn.click(function (){
            NftDetailPane.nftSendPane.show()
            NftDetailPane.sendPaneNft.show()
            sendNft.init(uri, tokenId, address)
        })

        fetch(uri).then(resp => {
            resp.json().then(json => {
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
