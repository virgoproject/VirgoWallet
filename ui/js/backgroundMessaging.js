async function getBaseInfos(){
    return await browser.runtime.sendMessage({command: 'getBaseInfos'})
}

async function getAsset(contract){
    const res = await getBaseInfos()

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

async function getMnemonic(){
    return await browser.runtime.sendMessage({command: 'getMnemonic'})
}

async function setPassword(password, oldPassword){
    return await browser.runtime.sendMessage({command: 'setPassword', password: password, oldPassword: oldPassword})
}

async function passwordMatch(password){
    return await browser.runtime.sendMessage({command: 'passwordMatch', password: password})
}

async function isEncrypted(){
    const res = await getBaseInfos()
    return res.encrypted
}

async function restoreFromMnemonic(mnemonic){
    return await browser.runtime.sendMessage({command: 'restoreFromMnemonic', mnemonic: mnemonic})
}