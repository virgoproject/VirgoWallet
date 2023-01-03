function inject() {
    const script = document.createElement("script")
    script.src = browser.runtime.getURL('/content/web3Provider.js');
    script.onload = function() {
        this.remove();
    };
    document.documentElement.appendChild(script)
}

inject()

function sendEvent(name, detail){
    const varName = Date.now() + "." + Math.random()

    window[varName] = detail
    if(typeof cloneInto === 'function')
        window[varName] = cloneInto(detail, window)

    window.dispatchEvent(new CustomEvent(name, {detail: window[varName]}))
}

window.addEventListener("message", function(e) {
    const method = e.data.method
    const params = e.data.params
    const reqId = e.data.reqId
    const origin = e.origin

    browser.runtime.sendMessage({command: 'web3Request', origin: origin, method: method, params: params, reqId: reqId})
});

browser.runtime.sendMessage({command: 'getBaseInfos'})
    .then(function(response){
        if(response.locked || !response.connectedSites.includes(window.location.origin)) return
        sendEvent("virgoChainChanged", response.wallets[response.selectedWallet].wallet.chainID)
        sendEvent("virgoAccountsChanged", [response.addresses[response.selectedAddress].address])
    })

browser.runtime.onMessage.addListener(request => {
    switch(request.command){
        case "chainChanged":
            sendEvent("virgoChainChanged", request.data)
            break
        case "accountsChanged":
            sendEvent("virgoAccountsChanged", request.data)
            break
        case "web3Response":
            sendEvent(request.id, request.resp)
            break
    }
})
