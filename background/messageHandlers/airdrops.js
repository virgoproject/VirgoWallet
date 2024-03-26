class AirdropsHandlers {

    static register(){
        addBgMessageHandler("checkAirdropJoined", this.checkAirdropJoined)
        addBgMessageHandler("setAirdropJoined", this.setAirdropJoined)
        addBgMessageHandler("resetAirdrops", this.resetAirdrops)
    }

    static checkAirdropJoined(request, sender, sendResponse){
        browser.storage.local.get('airdropinfos').then(function(res){
            let addressUser = baseWallet.addresses[0]
            let airdropID = request.id

            if(res === undefined || res.airdropinfos === undefined){
                sendResponse(false)
                return
            }

            const result = res.airdropinfos.filter(record => record.address == addressUser && record.airdropid == airdropID)
            if (result.length <= 0){
                sendResponse(false)
            } else {
                sendResponse(true)
            }
        })
    }

    static setAirdropJoined(request, sender, sendResponse){
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
