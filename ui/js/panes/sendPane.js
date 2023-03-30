class SendPane {

    static amount = $("#sendConfirm .amount")
    static assetSelect = $("#sendConfirm .assetSelect")
    static balance = $("#body .send .sendForm .sendBal val")
    static btnSubmit = $("#body .send .sendForm .submit")
    static recipient = $("#body .send .sendForm .recipient")
    static btnConfirm = $("#sendConfirm .submit")
    static sendForm = $("#body .send .sendForm")
    static confirmForm = $("#sendConfirm")
    static confirmFormBalance = $("#sendConfirm .balance")
    static confirmFeesForm = $("#sendConfirm .sendBtn")
    static feesForm = $("#sendConfirmFees")
    static feesFormBack = $("#sendConfirmFees .back")
    static backBtn = $("#sendConfirm .back")
    static confirmAmount = $("#sendConfirmFees .amount .value")
    static confirmTicker = $("#sendConfirmFees .amount .ticker")
    static confirmRecipient = $("#sendConfirmFees .recipient .value")
    static confirmFrom = $("#sendConfirmFees .from .value")
    static confirmFees = $("#sendConfirmFees .fees .value")
    static confirmFeesRange = $("#rangeFees")
    static sendBal = $("#body .send .sendForm .sendBal span")
    static maxBtn = $("#sendConfirm .max")
    static select = $(" #sendConfirm #sendTo")



    static btnContacts = $("#body .send .sendForm .contactButton")
    static headerValues = $(".header .stats")
    static topbarValues = $(".header .topbar")
    static contactsList = $("#contacts ")
    static contactsBack = $("#contacts .back")
    static bodyContacts = $('#contacts #contactDiv')
    static buttonContacts = $('#contacts .addContact')
    static divContactClone = $('#contacts .contactUser')
    static divContactList = $('#contacts .contactsList')
    static contactExemple = $('#contactEx')


    static estimateFees = null;

    constructor() {
        const _this = this
        let addrFrom
        let confirmInterval;

        SendPane.divContactList.html("")

        SendPane.btnContacts.click(function() {
            SendPane.sendForm.hide()
            SendPane.contactsList.show()
            hideStatsBar()
            SendPane.bodyContacts.show()
            SendPane.buttonContacts.show()

            ContactsPane.loadContacts()
        })
        SendPane.contactsBack.click(function() {

        })



        SendPane.btnSubmit.click(function(){
            $("#body .send .sendForm").hide()
            SendPane.confirmForm.show()
            hideStatsBar()
        })

        $("#sendTo").change(function (){
            getAsset(SendPane.select.val()).then(function(assetInfos){

                let tickerBalance
                if (assetInfos.ticker !== MAIN_ASSET.ticker){
                    tickerBalance = assetInfos.contract
                }else{
                    tickerBalance = assetInfos.ticker
                }
                getBalance(tickerBalance).then(function (nativeBalance){
                    let amount = $("#amountSend").val()
                    const balance =  Utils.formatAmount(nativeBalance.balance, nativeBalance.decimals)

                    SendPane.confirmFormBalance.find("val").html(balance)
                    $("#sendConfirm .ticker").html(nativeBalance.ticker)

                })
            })
        })

        $(':input').bind('keyup mouseup',function (){
            getAsset(SendPane.select.val()).then(function(assetInfos2){

                let tickerBalance2
                if (assetInfos2.ticker !== MAIN_ASSET.ticker){
                    tickerBalance2 = assetInfos2.contract
                }else{
                    tickerBalance2 = assetInfos2.ticker
                }
                getBalance(tickerBalance2).then(function (nativeBalance2){
                    const balance =  Utils.formatAmount(nativeBalance2.balance, nativeBalance2.decimals)
                    let amount = $("#amountSend").val()

                    $("#sendConfirm #showCost").html(Number(amount) * Number(nativeBalance2.price))

                    if (Number(balance) >= Number(amount) && Number(amount) != 0)
                        $('#sendNextStep').attr("disabled", false)
                    else
                        $('#sendNextStep').attr("disabled", true)
                })
            })
        })

        SendPane.confirmFeesForm.click(function (){
            SendPane.confirmForm.hide()
            SendPane.feesForm.show()

            getBaseInfos().then(function(res){
                const selectedAddress = res.addresses[res.selectedAddress].address

                getAsset(SendPane.select.val()).then(function(assetInfos){

                    SendPane.confirmAmount.html(SendPane.amount.val())

                    SendPane.confirmTicker.html(assetInfos.ticker)

                    SendPane.confirmRecipient.find("val").html(SendPane.recipient.val())

                    SendPane.confirmFrom.html(selectedAddress)

                    let contract
                    if (assetInfos.ticker === MAIN_ASSET.ticker)
                        contract = MAIN_ASSET.ticker
                    else
                        contract = assetInfos.contract

                    estimateSendFees(SendPane.recipient.val(), Utils.toAtomicString(SendPane.amount.val(), assetInfos.decimals), contract).then(function(fees){

                        getBalance(MAIN_ASSET.ticker).then(function (feesBalance) {

                            getBalance(contract).then(function (sendBalance) {

                            let gas = fees.gasLimit
                            let decimals = MAIN_ASSET.decimals
                            let amount  = SendPane.amount.val()
                            let editFees = document.querySelector("edit-fees");
                            let priceFees = feesBalance.price;
                            let priceAmount = sendBalance.price

                            const decimal = editFees.dataset.decimal = decimals
                            const lim = editFees.dataset.limit = gas
                            const ticker = editFees.dataset.ticker = MAIN_ASSET.ticker


                            document.getElementById("from").setAttribute("data-jdenticon-value",selectedAddress)
                            document.getElementById("to").setAttribute("data-jdenticon-value",SendPane.recipient.val())

                            $("#sendReviewNetFeesTicker").html(ticker);
                            editFees.start(gas);

                            editFees.onGasChanged = (gasPrice, gasLimit) => {
                                let totalNativ = Number(Utils.formatAmount(gasLimit * editFees.getGas(), decimals))

                                if (MAIN_ASSET.ticker == assetInfos.ticker)
                                        totalNativ += Number(amount)

                                if (totalNativ <=  Utils.formatAmount(assetInfos.balance, assetInfos.decimals)){
                                    $("#confirmSendBtn").find("val").html("Send")
                                    $("#confirmSendBtn").attr("disabled", false)
                                }

                                $("#sendReviewNetFees").html(Utils.formatAmount(gas * editFees.getGas(), decimals))
                                $("#sendReviewCost").html(totalNativ)
                                $("#sendReviewCostTicker").html(MAIN_ASSET.ticker)
                            }
                        })
                        })
                        })
                    })
            })

        })

        SendPane.backBtn.click(function(){
            if($(this).attr("disabled")) return;
            SendPane.btnSubmit.attr("disabled", false)
            SendPane.confirmForm.hide()
            $("#sendTo").val('default').selectpicker("refresh");
            SendPane.sendForm.show()

            clearInterval(confirmInterval)
        })

        $("#sendConfirmFees .back").click(function (){
            let editFees = document.querySelector("edit-fees")
            editFees.style.marginTop = "0px"
            SendPane.feesForm.hide()
            $("#confirmSendBtn").attr("disabled", true)
            $("#swapReview").hide()
            SendPane.confirmForm.show()
            clearInterval(confirmInterval)
            })



        $("#confirmSendBtn").click(function(){
            clearInterval(confirmInterval)
            console.log(SendPane.confirmFees.attr("gasLimit"))
            console.log(SendPane.confirmFees.attr("gasPrice"))
            sendTo(SendPane.recipient.val(),
                SendPane.amount.val(),
                SendPane.select.val(),
                SendPane.confirmFees.attr("gasLimit"),
                SendPane.confirmFees.attr("gasPrice"))
                .then(function(res){
                    notyf.success("Transaction sent!")
                    SendPane.recipient.val("")
                    SendPane.amount.val(null)
                    $("#sendTo").val('default').selectpicker("refresh");
                    SendPane.confirmForm.hide()
                    SendPane.feesForm.hide()
                    $("#body .send .sendForm").show()

                })

        })

        SendPane.select.change(function(){
            SendPane.btnSubmit.attr("disabled", true)
            SendPane.amount.val("")
            getAsset($(this).val()).then(function(asset){
                SendPane.sendBal.html(asset.ticker)
                SendPane.balance.attr("data-bal", asset.contract)
                SendPane.balance.html(Utils.formatAmount(asset.balance, asset.decimals))

                //wait for price to be updated
                setTimeout(function(){
                    SendPane.amount.trigger("input")
                }, 100)

            })
        })

        $("#sendConfirm .max").click(function (){
            if(SendPane.select.val() === MAIN_ASSET.ticker){
                getBaseInfos().then(function(res) {
                    const selectedAddress = res.addresses[res.selectedAddress].address
                    estimateSendFees(selectedAddress, Utils.toAtomicString(SendPane.confirmFormBalance.find("val").html(), MAIN_ASSET.decimals), MAIN_ASSET.ticker).then(function (fees) {
                        let maxSendable = new BN(Utils.toAtomicString(SendPane.confirmFormBalance.find("val").html(), MAIN_ASSET.decimals))
                        maxSendable = maxSendable.sub(new BN(fees.gasLimit * fees.gasPrice))
                        SendPane.amount.val(Utils.formatAmount(maxSendable.toString(), MAIN_ASSET.decimals))
                        SendPane.amount.trigger("input")
                    })
                })
            }else{
                SendPane.amount.val(SendPane.confirmFormBalance.find("val").html())
                SendPane.amount.trigger("input")
            }
        })

        SendPane.recipient.on("input", function(){
            const input = $(this);
            if(input.val().length < 42){
                input.removeClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }
            validateAddress(input.val()).then(function(res){
                if(!res){
                    input.addClass("is-invalid")
                    SendPane.btnSubmit.attr("disabled", true)
                    return
                }

                input.removeClass("is-invalid")
                sendPane.checkSendFormValues()
            })
        })

        SendPane.amount.on("input", function(){
            const max = parseFloat(SendPane.balance.html())
            const amount = parseFloat($(this).val())

            if(isNaN(amount) || amount == 0){
                $(this).removeClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }

            if(amount < 0 || amount > max){
                $(this).addClass("is-invalid")
                SendPane.btnSubmit.attr("disabled", true)
                return
            }

            $(this).removeClass("is-invalid")
            sendPane.checkSendFormValues()
        })

        events.addListener("assetsChanged", function (data){
            _this.setSend(data)
        })

        events.addListener("addressChanged", () => {
            SendPane.recipient.val("")
            SendPane.btnSubmit.attr("disabled", true)
            SendPane.amount.val("")
        })

    }

    setSend(data){
        SendPane.select.html("")
        SendPane.recipient.val("")
        SendPane.amount.val("")
        SendPane.backBtn.attr("disabled", false)
        enableLoadBtn(SendPane.btnSubmit)
        SendPane.backBtn.click()
        const selectedAddress = data.addresses[data.selectedAddress]
        Object.entries(selectedAddress.balances).map(([contractAddr, balance]) => {
            if(!balance.tracked) return
            let actualAddress = data.wallets[data.selectedWallet].wallet.ticker
            let sa = ('https://raw.githubusercontent.com/virgoproject/tokens/main/" + actualAddress + "/" + balance.contract + "/logo.png')


            let elem = $("<option></option>")
            elem.val(contractAddr)
            elem.html(balance.ticker)

            if(MAIN_ASSET.contract === balance.contract)
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+MAIN_ASSET.ticker+'/'+MAIN_ASSET.ticker+'/logo.png);"></div><span class="selectText">'+MAIN_ASSET.ticker+'</span>')
            else
                elem.attr("data-content",
                    '<div class="selectLogo" style="background-image: url(https://raw.githubusercontent.com/virgoproject/tokens/main/'+actualAddress+'/'+balance.contract+'/logo.png);"></div><span class="selectText">'+balance.ticker+'</span>')

            SendPane.select.append(elem)
        })
        SendPane.select.selectpicker('refresh');
    }

    checkSendFormValues(){
        const recipient = SendPane.recipient;
        if(recipient.val() < 42 || recipient.hasClass("is-invalid"))
            return

        let amountVal = parseFloat(SendPane.amount.val())

        if(isNaN(amountVal) || amountVal <= 0 || SendPane.amount.hasClass("is-invalid"))
            return

        SendPane.btnSubmit.attr("disabled", false)
    }
}

const sendPane = new SendPane()
