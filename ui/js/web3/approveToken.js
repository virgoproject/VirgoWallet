function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

window.jdenticon_config = {
    hues: [281],
    lightness: {
        color: [0.47, 0.67],
        grayscale: [0.28, 0.48]
    },
    saturation: {
        color: 0.61,
        grayscale: 0.02
    },
    backColor: "#dcd3e6"
};

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")
let mainAssetTicker = get("ticker")

let editFees = document.querySelector("edit-fees")
const decimal = editFees.dataset.decimal = decimals
editFees.dataset.limit = gas
const MainTicker = editFees.dataset.ticker = mainAssetTicker
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

$(".editFees").click(function (){
    $("#editfees").show()
})

getTokenDetails(get("allowed")).then(function(detail){
    $("#siteName").html(detail.symbol)
})
getAsset(ticker).then(function(assetInfos){
    editFees.onGasChanged = (gasPrice, gasLimit) => {

        $("#allow").unbind("click").click(async () => {
            await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: true, params: {gasPrice: gasPrice}})
            window.close()
        })

        let totalNativ = Number(Utils.formatAmount(gasLimit * gasPrice, decimals))

        if (ticker == assetInfos.ticker)
            totalNativ += Number(amount)

        if (Utils.formatAmount(totalNativ,decimals) <=  Utils.formatAmount(assetInfos.balance, assetInfos.decimals)){
            $("#allow").attr("disabled", false)
        }

        $("#fees").html(Utils.formatAmount(gasLimit * gasPrice, decimals))
    }
    editFees.start(gas)
})
$("svg").attr("data-jdenticon-value",get("addr"))

window.moveTo((screen.width - 370) / 2, (screen.height - 600) / 2)