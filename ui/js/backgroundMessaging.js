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