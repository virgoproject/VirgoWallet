async function getAsset(contract){
    const res = await browser.runtime.sendMessage({command: 'getBaseInfos'})

    const selectedWallet = res.wallets[res.selectedWallet].wallet;

    if(selectedWallet.contract == contract)
        return {
            "name": selectedWallet.name,
            "ticker": selectedWallet.ticker,
            "decimals": selectedWallet.decimals,
            "contract": selectedWallet.contract
        }

    for(const asset of selectedWallet.tokens)
        if(asset.contract == contract) return asset

    return false
}

async function validateAddress(address){
    return await browser.runtime.sendMessage({command: 'validateAddress', address: address})
}

async function estimateSendFees(recipient, amount, asset){
    return await browser.runtime.sendMessage({command: 'estimateSendFees', recipient: recipient, amount: amount, asset: asset})
}

async function getBalance(asset){
    return await browser.runtime.sendMessage({command: 'getBalance', asset: asset})
}

async function sendTo(recipient, amount, asset){
    return await browser.runtime.sendMessage({command: 'sendTo', recipient: recipient, amount: amount, asset: asset})
}