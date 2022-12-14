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

$("#data").html(get("data"))
$("#feesTicker").html(ticker)

function estimateFees() {
    $("#allow").attr("disabled", true)
    getBalance(ticker).then(function(balance){
        getGasPrice().then(function(gasPrice){



            let nativeTotal = amount + gas * gasPrice

            $("#fees").html(Utils.formatAmount(gas * gasPrice, decimals))

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
