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
    return await browser.runtime.sendMessage({command: 'validateAddress', address})
}

async function hasAsset(address){
    return await browser.runtime.sendMessage({command: 'hasAsset', address})
}


async function estimateSendFees(recipient, amount, asset){
    return await browser.runtime.sendMessage({command: 'estimateSendFees', recipient, amount, asset})
}

async function estimateSendFees(recipient,amount,asset){
    return await browser.runtime.sendMessage({command: 'estimateSendFees', recipient: recipient, amount: amount, asset: asset})
}

async function estimateSendFeesNft(recipient ,tokenId, address){
    return await browser.runtime.sendMessage({command: 'estimateSendFeesNft',recipient: recipient ,tokenId: tokenId, address: address})
}

async function getGasPrice(){
    return await browser.runtime.sendMessage({command: 'getGasPrice'})
}

async function getBalance(asset){
    return await browser.runtime.sendMessage({command: 'getBalance', asset})
}

async function sendTo(recipient, amount, asset, gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'sendTo', recipient, amount, asset, gasLimit, gasPrice})
}

async function sendToNft(recipient, contractNft, tokenId , gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'sendToNft', recipient: recipient, contractNft: contractNft, tokenId: tokenId, gasLimit: gasLimit, gasPrice: gasPrice})
}

async function getMnemonic(){
    return await browser.runtime.sendMessage({command: 'getMnemonic'})
}

async function setPassword(password, oldPassword){
    return await browser.runtime.sendMessage({command: 'setPassword', password, oldPassword})
}

async function passwordMatch(password){
    return await browser.runtime.sendMessage({command: 'passwordMatch', password})
}

async function isEncrypted(){
    const res = await getBaseInfos()
    return res.encrypted
}

async function restoreFromMnemonic(mnemonic){
    setTimeout(() => {
        tutorialPane.checkDisplay()
    }, 5000)
    return await browser.runtime.sendMessage({command: 'restoreFromMnemonic', mnemonic})
}

async function isMnemonicValid(mnemonic){
    return await browser.runtime.sendMessage({command: 'isMnemonicValid', mnemonic})
}

async function addAccount(){
    return await browser.runtime.sendMessage({command: 'addAccount'})
}

async function changeAccount(accountID){
    return await browser.runtime.sendMessage({command: 'changeAccount', accountID})
}

async function changeAccountName(address, newName){
    return await browser.runtime.sendMessage({command: 'changeAccountName', address, newName})
}

async function getTokenDetails(asset){
    return await browser.runtime.sendMessage({command: 'getTokenDetails', asset})
}

async function getNftDetails(asset, tokenID){
    return await browser.runtime.sendMessage({command: 'getNftDetails', asset, tokenID})
}

async function addAsset(name, symbol, decimals, contract){
    return await browser.runtime.sendMessage({command: 'addToken', name, symbol, decimals, contract})
}

async function addNft(uri,tokenId,owner,contract,collection){
    return await browser.runtime.sendMessage({command: 'addNft', uri, tokenId, owner, contract, collection})
}

function closedBackupPopup(){
    browser.runtime.sendMessage({command: 'closedBackupPopup'})
}

async function changeAssetTracking(contract){
    return await browser.runtime.sendMessage({command: 'changeTokenTracking', contract})
}

async function getSpeedupGasPrice(hash){
    return await browser.runtime.sendMessage({command: 'getSpeedupGasPrice', hash})
}

async function speedUpTransaction(hash, gasPrice){
    return await browser.runtime.sendMessage({command: 'speedUpTransaction', hash, gasPrice: parseInt(gasPrice)})
}

async function getCancelGasPrice(hash){
    return await browser.runtime.sendMessage({command: 'getCancelGasPrice', hash})
}

async function cancelTransaction(hash, gasPrice){
    return await browser.runtime.sendMessage({command: 'cancelTransaction', hash, gasPrice: parseInt(gasPrice)})
}

function closedUpdatePopup(){
    browser.runtime.sendMessage({command: 'closedUpdatePopup'})
}

async function getAutolock(){
    return await browser.runtime.sendMessage({command: 'getAutolock'})
}

function setAutolock(enabled, delay){
    browser.runtime.sendMessage({command: 'setAutolock', enabled, delay})
}

function setBiometrics(enabled){
    browser.runtime.sendMessage({command: 'setBiometrics', enabled})
}

async function getBiometrics(){
    return await browser.runtime.sendMessage({command: 'getBiometrics'})
}

async function addingContact(address, name, note, favorite) {
   return await browser.runtime.sendMessage({command: 'addContact', address, name, note, favorite})
}

function deleteContact(address){
     browser.runtime.sendMessage({command: 'deleteContact', address})
}

function updateContact(contactIndex, name, note) {
    browser.runtime.sendMessage({command: 'updateContact', contactIndex, name, note})
}

function deleteFavorite(address) {
    browser.runtime.sendMessage({command: 'deleteFavorite', address})
}

async function getContacts(){
    return await browser.runtime.sendMessage({command: 'getContacts'})
}

async function getSwapRoute(amount, token1, token2){
    return await browser.runtime.sendMessage({command: 'getSwapRoute', amount, token1, token2})
}

async function estimateSwapFees(amount, quote){
    return await browser.runtime.sendMessage({command: 'estimateSwapFees', amount, quote})
}

async function initSwap(amount, quote, gasPrice){
    return await browser.runtime.sendMessage({command: 'initSwap', amount, quote, gasPrice})
}

function removeToken(address){
    browser.runtime.sendMessage({command: 'removeToken', address})
}

function removeNft(address, tokenId){
    browser.runtime.sendMessage({command: 'removeNft' , address:address, tokenId })
}

async function getBalanceCross(chainID, asset){
    return await browser.runtime.sendMessage({command: 'getBalanceCross', chainID, asset})
}

async function estimateAtomicSwapFees(chainID){
    return await browser.runtime.sendMessage({command: 'estimateAtomicSwapFees', chainID})
}

async function initAtomicSwap(amount, chainA, chainB, gasPrice){
    return await browser.runtime.sendMessage({command: 'initAtomicSwap', amount, chainA, chainB, gasPrice})
}

async function tickerFromChainID(id){
    return await browser.runtime.sendMessage({command: 'tickerFromChainID', id})
}

async function checkAirdropPlay(address,id){
    return await browser.runtime.sendMessage({command: 'checkAirdropPlay', address, id})
}

async function setAirdropPlay(address,id){
    return await browser.runtime.sendMessage({command: 'setAirdropPlay', address, id})
}

async function resetAirdrops(){
    return await browser.runtime.sendMessage({command: 'resetAirdrops'})
}

async function checkClosedModalAirdrop(infos){
    return await browser.runtime.sendMessage({command: 'checkClosedModal', infos})
}

async function changeModalStatus(state){
    return await browser.runtime.sendMessage({command: 'changeModalStatus', state})
}

async function deleteConnectedSite(address){
    return await browser.runtime.sendMessage({command: 'deleteConnectedSite', address})
}

async function setSetupDone(){
    return await browser.runtime.sendMessage({command: 'setSetupDone'})
}

async function isTutorialDone(){
    return await browser.runtime.sendMessage({command: 'tutorialDone'})
}

async function setTutorialDone(){
    return await browser.runtime.sendMessage({command: 'setTutorialDone'})
}

async function setSelectedCurrency(currency) {
    return await browser.runtime.sendMessage({command: 'setSelectedCurrency', currency})
}

async function getNotifications(){
    return await browser.runtime.sendMessage({command: 'getNotifications'})
}

async function hideNotification(id){
    return await browser.runtime.sendMessage({command: 'hideNotification', id})
}

async function changeNetworkVisibility(index){
    return await browser.runtime.sendMessage({command: "changeNetworkVisibility", index})
}

async function addNetwork(name, rpc, chainID, symbol, explorer){
    return await browser.runtime.sendMessage({command: "addNetwork", name, rpc, chainID, symbol, explorer})
}
