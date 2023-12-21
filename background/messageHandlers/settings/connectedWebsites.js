class ConnectedWebsitesHandlers {

    static register(){
        addBgMessageHandler("deleteConnectedSite", this.deleteConnectedSite)
    }

    static deleteConnectedSite(request, sender, sendResponse){
        for (let i=0 ; i < connectedWebsites.length ; i++)
        {
            if (connectedWebsites[i] === request.address) {
                connectedWebsites.splice(i, 1)
                sendResponse({'accepted': true,'siteLength' : connectedWebsites.length})
                break
            }else if(connectedWebsites[i].type === "walletConnect" && connectedWebsites[i].params.topic === request.address){
                connectedWebsites.splice(i, 1)
                walletConnect.disconnect(request.address)
                sendResponse({'accepted': true,'siteLength' : connectedWebsites.length})
                break
            }
        }
        sendResponse(true)
    }

}

ConnectedWebsitesHandlers.register()
