async function getBaseInfos(){
    return await browser.runtime.sendMessage({command: 'getBaseInfos'})
}

async function getChainInfos(chainID){
    return await browser.runtime.sendMessage({command: "getChainInfos", chainID})
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

async function getTransaction(hash){
    return await browser.runtime.sendMessage({command: 'getTransaction', hash})
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

async function estimateSendFeesNft(recipient ,tokenId, address){
    return await browser.runtime.sendMessage({command: 'estimateSendFeesNft', recipient, tokenId, address})
}

async function getGasPrice(chainID = ""){
    return await browser.runtime.sendMessage({command: 'getGasPrice', chainID})
}

async function getBalance(asset){
    return await browser.runtime.sendMessage({command: 'getBalance', asset})
}

async function sendTo(recipient, amount, asset, gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'sendTo', recipient, amount, asset, gasLimit, gasPrice})
}

async function sendToNft(recipient, contractNft, tokenId , gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'sendToNft', recipient, contractNft, tokenId, gasLimit, gasPrice})
}

async function getMnemonic(){
    return await browser.runtime.sendMessage({command: 'getMnemonic'})
}

async function setPassword(password){
    return await browser.runtime.sendMessage({command: 'setPassword', password})
}

async function passwordMatch(password){
    return await browser.runtime.sendMessage({command: 'passwordMatch', password})
}

async function isEncrypted(){
    const res = await getBaseInfos()
    return res.encrypted
}

async function restoreFromMnemonic(mnemonic){
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

async function deleteAccount(address){
    return await browser.runtime.sendMessage({command: 'deleteAccount', address})
}

async function getHiddenAccounts(){
    return await browser.runtime.sendMessage({command: 'getHiddenAccounts'})
}

async function unhideAccount(address){
    return await browser.runtime.sendMessage({command: 'unhideAccount', address})
}

async function getTokenDetails(asset){
    return await browser.runtime.sendMessage({command: 'getTokenDetails', asset})
}

async function getTokenDetailsCross(contract, chainID){
    return await browser.runtime.sendMessage({command: 'getTokenDetailsCross', contract, chainID})
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

async function addContact(address, name, favorite) {
   return await browser.runtime.sendMessage({command: 'addContact', address, name, favorite})
}

async function deleteContact(address){
    return await browser.runtime.sendMessage({command: 'deleteContact', address})
}

async function updateContact(address, name, favorite) {
    return await browser.runtime.sendMessage({command: 'updateContact', address, name, favorite})
}

async function getContacts(){
    return await browser.runtime.sendMessage({command: 'getContacts'})
}

async function getContact(address){
    return await browser.runtime.sendMessage({command: 'getContact', address})
}

async function getSwapRoute(amount, tokenIn, chainIn, tokenOut, chainOut){
    return await browser.runtime.sendMessage({command: 'getSwapRoute', amount, tokenIn, chainIn, tokenOut, chainOut})
}

async function estimateSwapFees(chainIn, tokenIn, chainOut, tokenOut, amount, quote){
    return await browser.runtime.sendMessage({command: 'estimateSwapFees', chainIn, tokenIn, chainOut, tokenOut, amount, quote})
}

async function initSwap(chainIn, tokenIn, chainOut, tokenOut, amount, quote, gasLimit, gasPrice){
    return await browser.runtime.sendMessage({command: 'initSwap', chainIn, tokenIn, chainOut, tokenOut, amount, quote, gasLimit, gasPrice})
}

async function getCrossSwaps(){
    return await browser.runtime.sendMessage({command: 'getCrossSwaps'})
}

async function getCrossSwap(hash){
    return await browser.runtime.sendMessage({command: 'getCrossSwap', hash})
}

function removeToken(address){
    browser.runtime.sendMessage({command: 'removeToken', address})
}

function removeNft(address, tokenId){
    browser.runtime.sendMessage({command: 'removeNft' , address:address, tokenId })
}

async function getBalanceCross(chainID, asset = ""){
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

async function joinAirdrop(id, twitterUsername){
    return await browser.runtime.sendMessage({command: "joinAirdrop", id, twitterUsername})
}

async function claimDailyReward(){
    return await browser.runtime.sendMessage({command: "claimDailyReward"})
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

async function getAllTokens(){
    return await browser.runtime.sendMessage({command: "getAllTokens"})
}

async function getFiatTokens(){
    return await browser.runtime.sendMessage({command: "getFiatTokens"})
}

async function createTransakOrder(tokenIn, tokenOut, amountIn, route, orderId){
    return await browser.runtime.sendMessage({command: "createTransakOrder", tokenIn, tokenOut, amountIn, route, orderId})
}

async function getMailAddress(){
    return await browser.runtime.sendMessage({command: "getMailAddress"})
}

async function setMailAddress(mailAddress){
    return await browser.runtime.sendMessage({command: "setMailAddress", mailAddress})
}

async function addAccountFromPrivateKey(pKey){
    return await browser.runtime.sendMessage({command: "addAccountFromPrivateKey", pKey})
}
