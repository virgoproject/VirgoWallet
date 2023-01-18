function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

$("#siteName").html(get("origin"))
let tag;
tag = document.querySelector("edit-fees")

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

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")
console.log(gas)
$("#from").html(get("from"))
$("#to").html(get("to"))
$("#amount").html(Utils.formatAmount(amount, decimals))
$("#data").html(get("data"))
$(".ticker").html(ticker)


function estimateFees() {
    getBalance(ticker).then(function(balance) {
        getGasPrice().then(function (res) {
            tag.start(gas, res)
            console.log()
            let nativeTotal = gas * tag.getGas()

            if(nativeTotal <= balance.balance)
                $("#allow").attr("disabled", false)
        })
    })
}



setInterval(function(){
    estimateFees()
}, 2500)

$("#rangeFees").on("input", function(){
    estimateFees()
})

estimateFees()

window.moveTo((screen.width - 370) / 2, (screen.height - 600) / 2)