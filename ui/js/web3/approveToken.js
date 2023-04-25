function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")
let mainAssetTicker = get("ticker")

let editFees = document.querySelector("edit-fees")
const decimal = editFees.dataset.decimal = decimals
editFees.dataset.limit = gas
const MainTicker = editFees.dataset.ticker = mainAssetTicker
editFees.start(gas)
let finalGasPrice = 0


$("#refuse").click(async () => {
    await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: false})
    window.close()
})

window.onbeforeunload = () => {
    const resp = async () => {
        await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: false})
    }
    resp()
}

$("#siteLogo img").on("error", function(){
    $("#siteLogo img").attr("src", get("origin")+"/favicon.png")
})
$("#siteLogo img").attr("src", get("origin")+"/favicon.ico")


$("#addr").html(get("addr"))
$("#data").html(get("data"))
$(".feesTicker").html(ticker)

getTokenDetails(get("allowed")).then(function(detail){
    $("#siteName").html(detail.symbol)
    console.log(detail)
})
getAsset(ticker).then(function(assetInfos){
    editFees.onGasChanged = (gasPrice, gasLimit) => {

        $("#allow").click(async () => {
            await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: true, params: {gasPrice: gasPrice}})
            window.close()
        })

        let totalNativ = Number(Utils.formatAmount(gasLimit * gasPrice, decimals))

        if (ticker == assetInfos.ticker)
            totalNativ += Number(amount)

        if (totalNativ <=  Utils.formatAmount(assetInfos.balance, assetInfos.decimals)){
            $("#allow").attr("disabled", false)
        }

        $("#fees").html(Utils.formatAmount(gasLimit * gasPrice, decimals))
    }
})
$("svg").attr("data-jdenticon-value",get("addr"))





