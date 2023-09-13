function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")

$("#siteName").html(get("origin"))

let editFees = document.querySelector("edit-fees")
const decimal = editFees.dataset.decimal = decimals

editFees.dataset.limit = gas

$(".editFees").click(function (){
    $("#editfees").show()
})

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


$("#from").html(get("from"))
$("#to").html(get("to"))
$("#amount").html(Utils.formatAmount(amount, decimals))
$("#data").html(get("data"))
$(".feesTicker").html(ticker)
$(".ticker").html(ticker)

getAsset(ticker).then(function(assetInfos){
    editFees.onGasChanged = (gasPrice, gasLimit) => {
        $("#allow").click(async () => {
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


window.moveTo((screen.width - 370) / 2, (screen.height - 600) / 2)