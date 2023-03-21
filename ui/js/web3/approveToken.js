function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")

let tag;
tag = document.querySelector("edit-fees")
const decimal = tag.dataset.decimal = decimals
const lim = tag.dataset.limit = gas
tag.start(gas)
let finalGasPrice = 0
$("#allow").click(async () => {
    await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: true, params: {gasPrice: tag.getGas()}})
    window.close()
})

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
tag.onGasChanged = () => {
    $("#fees").html(Utils.formatAmount(gas * tag.getGas(), decimals))
}
tag.onBalance = () => {
    $("#allow").attr("disabled", false)
}
$("svg").attr("data-jdenticon-value",get("addr"))





