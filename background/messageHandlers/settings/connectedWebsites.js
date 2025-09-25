class ConnectedWebsitesHandlers {

    static register(){
        addBgMessageHandler("deleteConnectedSite", this.deleteConnectedSite)
    }

    static deleteConnectedSite(request, sender, sendResponse){
        for (let i=0 ; i < connectedWebsites.length ; i++)
        {
            if (connectedWebsites[i] === request.address) {
                connectedWebsites.splice(i, 1)
                browser.storage.local.set({"connectedWebsites": connectedWebsites})
                sendResponse({'accepted': true,'siteLength' : connectedWebsites.length})
                return
            }else if(connectedWebsites[i].type === "walletConnect" && connectedWebsites[i].params.topic === request.address){
                connectedWebsites.splice(i, 1)
                browser.storage.local.set({"connectedWebsites": connectedWebsites})
                walletConnect.disconnect(request.address)
                sendResponse({'accepted': true,'siteLength' : connectedWebsites.length})
                return
            }
        }
        sendResponse({'accepted': false, 'siteLength' : connectedWebsites.length})
    }

}

ConnectedWebsitesHandlers.register()
