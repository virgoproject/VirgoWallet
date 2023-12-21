class AirdropsHandlers {

    static register(){
        addBgMessageHandler("checkAirdropPlay", this.checkAirdropPlay)
        addBgMessageHandler("setAirdropPlay", this.setAirdropPlay)
        addBgMessageHandler("resetAirdrops", this.resetAirdrops)
    }

    static checkAirdropPlay(request, sender, sendResponse){
        browser.storage.local.get('airdropinfos').then(function(res){
            let addressUser = request.address
            let airdropID = request.id
            console.log(res)
            if(res === undefined){
                sendResponse(false)
                return
            }

            const result = res.airdropinfos.filter(record => record.address == addressUser && record.airdropid == airdropID)
            if (result.length <= 0){
                sendResponse(true)
            } else {
                sendResponse(false)
            }
        })
    }

    static setAirdropPlay(request, sender, sendResponse){
        browser.storage.local.get('airdropinfos').then(function(res){
            let addressUser = request.address
            let airdropID = request.id
            const newAirdrop = {
                airdropid : airdropID,
                address : addressUser
            }

            if(res.airdropinfos === undefined) {
                browser.storage.local.set({"airdropinfos": [newAirdrop]})
                sendResponse(true)
            } else {
                const result = res.airdropinfos.filter(record => record.address === addressUser.address && record.id === airdropID.airdropid)
                console.log(result)
                if (result.length <= 0){
                    res.airdropinfos.push(newAirdrop)
                    browser.storage.local.set({"airdropinfos": res.airdropinfos})
                    sendResponse(true)
                } else {
                    sendResponse(false)
                }

            }
        })
    }

    static resetAirdrops(request, sender, sendResponse){
        browser.storage.local.set({"airdropinfos": []})
    }

}

AirdropsHandlers.register()
