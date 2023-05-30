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

async function hasAsset(address){
    return await browser.runtime.sendMessage({command: 'hasAsset', address: address})
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
    setTimeout(() => {
        tutorialPane.checkDisplay()
    }, 5000)
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

async function changeAccountName(address, newName){
    return await browser.runtime.sendMessage({command: 'changeAccountName', address:address, newName:newName})
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

async function getSpeedupGasPrice(hash){
    return await browser.runtime.sendMessage({command: 'getSpeedupGasPrice', hash: hash})
}

async function speedUpTransaction(hash, gasPrice){
    return await browser.runtime.sendMessage({command: 'speedUpTransaction', hash: hash, gasPrice: parseInt(gasPrice)})
}

async function getCancelGasPrice(hash){
    return await browser.runtime.sendMessage({command: 'getCancelGasPrice', hash: hash})
}

async function cancelTransaction(hash, gasPrice){
    return await browser.runtime.sendMessage({command: 'cancelTransaction', hash: hash, gasPrice: parseInt(gasPrice)})
}

function closedUpdatePopup(){
    browser.runtime.sendMessage({command: 'closedUpdatePopup'})
}

async function getAutolock(){
    return await browser.runtime.sendMessage({command: 'getAutolock'})
}

function setAutolock(enabled, delay){
    browser.runtime.sendMessage({command: 'setAutolock', enabled: enabled, delay: delay})
}

async function addingContact(address,name,note,favorite) {
   return await browser.runtime.sendMessage({command: 'addContact' , address:address , name:name , note:note , favorite:favorite })

}

function deleteContact(contactIndex){
     browser.runtime.sendMessage({command: 'deleteContact' , address:contactIndex })
}

function updateContact(index,name,note) {
    browser.runtime.sendMessage({command: 'updateContact' ,  contactIndex:index  , name:name , note:note  })

}

function deleteFavorite(index) {
    browser.runtime.sendMessage({command: 'deleteFavorite' , address:index })

}

async function getContacts(){
    return await browser.runtime.sendMessage({command: 'getContacts'})
}

async function getSwapRoute(amount, token1, token2){
    return await browser.runtime.sendMessage({command: 'getSwapRoute', amount: amount, token1: token1, token2: token2})
}

async function estimateSwapFees(amount, route){
    return await browser.runtime.sendMessage({command: 'estimateSwapFees', amount: amount, route: route})
}

async function initSwap(amount, route, gasPrice){
    return await browser.runtime.sendMessage({command: 'initSwap', amount: amount, route: route, gasPrice: gasPrice})
}

function removeToken(address){
    browser.runtime.sendMessage({command: 'removeToken' , address:address })
}

async function getBalanceCross(chainID, asset){
    return await browser.runtime.sendMessage({command: 'getBalanceCross', chainID: chainID, asset: asset})
}

async function estimateAtomicSwapFees(chainID){
    return await browser.runtime.sendMessage({command: 'estimateAtomicSwapFees', chainID: chainID})
}

async function initAtomicSwap(amount, chainA, chainB, gasPrice){
    return await browser.runtime.sendMessage({command: 'initAtomicSwap', amount: amount, chainA: chainA, chainB: chainB, gasPrice: gasPrice})
}

async function tickerFromChainID(id){
    return await browser.runtime.sendMessage({command: 'tickerFromChainID', id: id})
}

async function checkAirdropPlay(address,id){
    return await browser.runtime.sendMessage({command : 'checkAirdropPlay',address : address ,id : id})
}

async function setAirdropPlay(address,id){
    return await browser.runtime.sendMessage({command : 'setAirdropPlay',address : address ,id : id})
}

async function resetAirdrops(){
    return await browser.runtime.sendMessage({command : 'resetAirdrops'})
}

async function checkClosedModalAirdrop(infos){
    return await browser.runtime.sendMessage({command : 'checkClosedModal',infos : infos})
}

async function changeModalStatus(state){
    return await browser.runtime.sendMessage({command : 'changeModalStatus',state : state})
}

async function deleteConnectedSite(address){
    return await browser.runtime.sendMessage({command :'deleteConnectedSite',address : address})
}

async function setupDone(){
    return await browser.runtime.sendMessage({command : 'setupDone'})
}

async function tutorialDone(){
    return await browser.runtime.sendMessage({command : 'tutorialDone'})
}

async function setTutorialDone(){
    return await browser.runtime.sendMessage({command : 'setTutorialDone'})
}

async function setSelectedcurrency(currency) {
    return await browser.runtime.sendMessage({command : 'setSelectedcurrency', currency : currency})
}
