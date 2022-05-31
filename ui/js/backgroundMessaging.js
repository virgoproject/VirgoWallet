async function getBaseInfos(){
    return await browser.runtime.sendMessage({command: 'getBaseInfos'})
}

async function getAsset(contract){
    const res = await getBaseInfos()

    const selectedWallet = res.wallets[res.selectedWallet].wallet;

    if(selectedWallet.ticker == contract)
        return {
            "name": selectedWallet.name,
            "ticker": selectedWallet.ticker,
            "decimals": selectedWallet.decimals,
            "contract": selectedWallet.contract,
            "balance": res.addresses[res.selectedAddress].balances[selectedWallet.ticker].balance
        }

    for(const asset of selectedWallet.tokens)
        if(asset.contract == contract) return {
            "name": asset.name,
            "ticker": asset.ticker,
            "decimals": asset.decimals,
            "contract": asset.contract,
            "balance": res.addresses[res.selectedAddress].balances[asset.contract].balance
        }

    return false
}

async function validateAddress(address){
    return await browser.runtime.sendMessage({command: 'validateAddress', address: address})
}

async function estimateSendFees(recipient, amount, asset){
    return await browser.runtime.sendMessage({command: 'estimateSendFees', recipient: recipient, amount: amount, asset: asset})
}

async function getGasPrice(){
    return await browser.runtime.sendMessage({command: 'getGasPrice'})
}

async function getBalance(asset){
    return await browser.runtime.sendMessage({command: 'getBalance', asset: asset})
}

async function sendTo(recipient, amount, asset, gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'sendTo', recipient: recipient, amount: amount, asset: asset, gasLimit: gasLimit, gasPrice: gasPrice})
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

async function isMnemonicValid(mnemonic){
    return await browser.runtime.sendMessage({command: 'isMnemonicValid', mnemonic: mnemonic})
}

async function addAccount(){
    return await browser.runtime.sendMessage({command: 'addAccount'})
}

async function changeAccount(accountID){
    return await browser.runtime.sendMessage({command: 'changeAccount', accountID: accountID})
}

async function getTokenDetails(asset){
    return await browser.runtime.sendMessage({command: 'getTokenDetails', asset: asset})
}

async function addAsset(name, symbol, decimals, contract){
    return await browser.runtime.sendMessage({command: 'addToken', name: name, ticker: symbol, decimals: decimals, contract: contract})
}

function closedBackupPopup(){
    browser.runtime.sendMessage({command: 'closedBackupPopup'})
}

async function changeAssetTracking(contract){
    return await browser.runtime.sendMessage({command: 'changeTokenTracking', contract: contract})
}
