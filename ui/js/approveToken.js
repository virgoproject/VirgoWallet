function get(name){
    var r = /[?&]([^=#]+)=([^&#]*)/g,p={},match;
    while(match = r.exec(window.location)) p[match[1]] = match[2];
    return p[name];
}


let finalGasPrice = 0
$("#allow").click(async () => {
    await browser.runtime.sendMessage({command: 'resolveWeb3Authorization', id: get("id"), decision: true, params: {gasPrice: finalGasPrice}})
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
$("#addr").html(get("addr"))
$("#data").html(get("data"))
$("#feesTicker").html(ticker)

getTokenDetails(get("allowed")).then(function(detail){
    $("#siteName").html(detail.symbol)
    console.log(detail)
})

$("svg").attr("data-jdenticon-value",get("addr"))
$("#medium").addClass("selected")
$("#medium").find('.check').css("display","flex")

let feesModifier
function estimateFees() {
    $("#allow").attr("disabled", true)
    getBalance(ticker).then(function(balance){
        getGasPrice().then(function(gasPrice){
            const slow = $("#slow")
            const medium = $("#medium")
            const fast = $("#fast")

            if (document.getElementById('slow').classList.contains("selected")){
                 feesModifier = 0.8
            }

            if (document.getElementById('medium').classList.contains("selected")){
                 feesModifier = 1
            }

            if (document.getElementById('fast').classList.contains("selected")){
                 feesModifier = 1.2
            }

            finalGasPrice = Math.round(gasPrice * feesModifier)

            let nativeTotal = gas * finalGasPrice


            $("#fees").html(Utils.formatAmount(gas * finalGasPrice, decimals))

            $("#slow").click(function (){
                slow.addClass("selected")
                slow.find('.label').addClass("pl-0")
                $("#slow").find('.check').css("display","flex")

                if (document.getElementById('medium').classList.contains("selected")){
                    medium.removeClass("selected")
                    medium.find('.label').removeClass("pl-0")
                    $("#medium").find('.check').css("display","none")
                }

                if (document.getElementById('fast').classList.contains("selected")){
                    fast.removeClass("selected")
                    fast.find('.label').removeClass("pl-0")
                    $("#fast").find('.check').css("display","none")
                }
            })

            $("#medium").click(function (){
                medium.addClass("selected")
                medium.find('.label').addClass("pl-0")
                $("#medium").find('.check').css("display","flex")
                if (document.getElementById('slow').classList.contains("selected")){
                    slow.removeClass("selected")
                    slow.find('.label').removeClass("pl-0")
                    $("#slow").find('.check').css("display","none")
                }
                if (document.getElementById('fast').classList.contains("selected")){
                    fast.removeClass("selected")
                    fast.find('.label').removeClass("pl-0")
                    $("#fast").find('.check').css("display","none")
                }
            })

            $("#fast").click(function (){
                fast.addClass("selected")
                fast.find('.label').addClass("pl-0")
                $("#fast").find('.check').css("display","flex")
                if (document.getElementById('slow').classList.contains("selected")){
                    slow.removeClass("selected")
                    slow.find('.label').removeClass("pl-0")
                    $("#slow").find('.check').css("display","none")
                }
                if (document.getElementById('medium').classList.contains("selected")){
                    medium.removeClass("selected")
                    medium.find('.label').removeClass("pl-0")
                    $("#medium").find('.check').css("display","none")
                }
            })

            if(nativeTotal <= balance.balance)
                $("#allow").attr("disabled", false)

            $(".editFees").click(function (){
                $("#editFees").css("display","block")
                finalGasPriceSlow = Math.round(gasPrice * 0.8)
                finalGasPriceMedium = Math.round(gasPrice * 1)
                finalGasPriceFast = Math.round(gasPrice * 1.2)

                $("#editFeesSlow").html(Utils.formatAmount(gas * finalGasPriceSlow, decimals))
                $("#editFeesMedium").html(Utils.formatAmount(gas * finalGasPriceMedium, decimals))
                $("#editFeesFast").html(Utils.formatAmount(gas * finalGasPriceFast, decimals))

            })
        })
    })
}

$("#saveFees").click(function (){
    $("#editFees").css("display","none")
})

$("#closeFees").click(function (){
    $("#editFees").css("display","none")
})






setInterval(function(){
    console.log(Utils.formatAmount(gas*finalGasPrice,decimals))
    estimateFees()
}, 2500)

$("#rangeFees").on("input", function(){
    estimateFees()
})

estimateFees()





