//Unlock SJCL AES CTR mode
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."]()

//listen for messages sent by popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
        case "getBaseInfos":
            if(baseWallet === undefined)
                sendResponse({"locked": true})

            sendResponse({
                "wallets": baseWallet.getWalletsJSON(),
                "selectedWallet": baseWallet.selectedWallet,
                "addresses": baseWallet.getCurrentWallet().getAddressesJSON(),
                "selectedAddress": baseWallet.selectedAddress
            })
            break
    }
});

function forgetWallet() {
    browser.storage.local.remove("wallet");
    browser.storage.local.remove("lastShowedSetupPwMsg");
    wallet = null;
}