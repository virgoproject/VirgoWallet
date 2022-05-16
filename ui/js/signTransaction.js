function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}

$("#siteName").html(get("origin"))

let finalGasPrice = 0

$("#allow").click(function (){
    browser.runtime.sendMessage({command: 'authorizeTransaction', id: get("id"), decision: finalGasPrice})
    window.close()
})

$("#refuse").click(function (){
    browser.runtime.sendMessage({command: 'authorizeTransaction', id: get("id"), decision: false})
    window.close()
})

window.onbeforeunload = function(){
    browser.runtime.sendMessage({command: 'authorizeTransaction', id: get("id"), decision: false})
}

$("#siteLogo img").on("error", function(){
    $("#siteLogo img").attr("src", get("origin")+"/favicon.png")
})
$("#siteLogo img").attr("src", get("origin")+"/favicon.ico")

let gas = parseInt(get("gas"))
let ticker = get("ticker")
let amount = parseInt(get("value"))
let decimals = get("decimals")

$("#from").html(get("from"))
$("#to").html(get("to"))
$("#amount").html(Utils.formatAmount(amount, decimals))
$("#data").html(get("data"))
$(".ticker").html(ticker)

function estimateFees() {
    $("#allow").attr("disabled", true)
    getBalance(ticker).then(function(balance){
        getGasPrice().then(function(gasPrice){
            let feesModifier = 0.5 + $("#rangeFees").val()/100

            finalGasPrice = Math.round(gasPrice * feesModifier)

            let nativeTotal = amount + gas * finalGasPrice

            $("#fees").html(Utils.formatAmount(gas * finalGasPrice, decimals))

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
