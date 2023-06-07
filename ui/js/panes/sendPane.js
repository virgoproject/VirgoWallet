class SendPane {

    static amount = $("#sendConfirm .amount")
    static assetSelect = $("#sendConfirm .assetSelect")
    static balance = $("#body .send .sendForm .sendBal val")
    static btnSubmit = $("#body .send .sendForm .submit")
    static recipient = $("#body .send .sendForm .recipient")
    static sendForm = $("#body .send .sendForm")
    static confirmForm = $("#sendConfirm")
    static confirmFormBalance = $("#sendConfirm .balance")
    static confirmFeesForm = $("#sendConfirm .sendBtn")
    static feesForm = $("#sendConfirmFees")
    static backBtn = $("#sendConfirm .back")
    static confirmAmount = $("#sendConfirmFees .amount .value")
    static confirmTicker = $("#sendConfirmFees .amount .ticker")
    static confirmRecipient = $("#sendConfirmFees .recipient .value")
    static confirmFrom = $("#sendConfirmFees .from .value")
    static confirmFees = $("#sendConfirmFees .fees .value")
    static sendBal = $("#body .send .sendForm .sendBal span")
    static select = $(" #sendConfirm #sendAssetSelect")

    static btnContacts = $("#body .send .sendForm .contactButton")
    static headerValues = $(".header .stats")
    static contactsList = $("#contacts ")
    static bodyContacts = $('#contacts #contactDiv')
    static buttonContacts = $('#contacts .addContact')
    static divContactClone = $('#contacts .contactUser')
    static divContactList = $('#contacts .contactsList')

    static estimateFees = null;

    constructor() {
        const _this = this
        let confirmInterval;

        $("#footerBtnSend").click(() => {
            _this.displayRecentRecipients()
        })

        SendPane.divContactList.html("")

        SendPane.btnContacts.click(function() {
            SendPane.sendForm.hide()
            SendPane.contactsList.show()
            hideStatsBar()
            SendPane.bodyContacts.show()
            SendPane.buttonContacts.show()

            ContactsPane.loadContacts()
        })

        SendPane.btnSubmit.click(function(){
            $("#body .send .sendForm").hide()
            SendPane.confirmForm.show()
            hideStatsBar()
        })

        $("#sendAssetSelect").change(function (){
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

        document.getElementById("amountSend").oninput = event => {
            getAsset(SendPane.select.val()).then(function(assetInfos){

                let tickerBalance
                if (assetInfos.ticker !== MAIN_ASSET.ticker){
                    tickerBalance = assetInfos.contract
                }else{
                    tickerBalance = assetInfos.ticker
                }

                getBalance(tickerBalance).then(function (nativeBalance){
                    const balance =  Utils.formatAmount(nativeBalance.balance, nativeBalance.decimals)
                    let amount = $("#amountSend").val()

                    if(amount == "")
                        $("#sendConfirm #showCost").html("-")
                    else
                        $("#sendConfirm #showCost").html(Number(amount) * Number(nativeBalance.price))

                    if (Number(balance) >= Number(amount) && Number(amount) != 0)
                        $('#sendNextStep').attr("disabled", false)
                    else
                        $('#sendNextStep').attr("disabled", true)
                })
            })
        }

        SendPane.confirmFeesForm.click(function (){
            SendPane.confirmForm.hide()
            $("#sendConfirmFeesLoading").show()

            getBaseInfos().then(function(res){
                const selectedAddress = res.addresses[res.selectedAddress].address

                getAsset(SendPane.select.val()).then(function(assetInfos){

                    SendPane.confirmAmount.html(SendPane.amount.val())

                    SendPane.confirmTicker.html(assetInfos.ticker)

                    SendPane.confirmRecipient.find("val").html(SendPane.recipient.val())

                    SendPane.confirmFrom.html(selectedAddress)

                    let editFees = document.querySelector("edit-fees");

                    const ticker = editFees.dataset.ticker = MAIN_ASSET.ticker

                    let contract
                    if (assetInfos.ticker === MAIN_ASSET.ticker)
                        contract = MAIN_ASSET.ticker
                    else
                        contract = assetInfos.contract

                    document.getElementById("from").setAttribute("data-jdenticon-value",selectedAddress)
                    document.getElementById("to").setAttribute("data-jdenticon-value",SendPane.recipient.val())

                    $("#sendReviewNetFeesTicker").html(ticker);
                    estimateSendFees(SendPane.recipient.val(), Utils.toAtomicString(SendPane.amount.val(), assetInfos.decimals), contract).then(function(fees){

                        editFees.onGasChanged = (gasPrice, gasLimit) => {

                            _this.gasLimit = gasLimit
                            _this.gasPrice = gasPrice

                            getBalance(MAIN_ASSET.ticker).then(function (mainBal) {
                                let totalNative = Number(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))

                                if (MAIN_ASSET.ticker == SendPane.select.val())
                                    totalNative += Number(SendPane.amount.val())

                                if (totalNative <= Utils.formatAmount(mainBal.balance, mainBal.decimals)) {
                                    $("#confirmSendBtn").find("val").html("Send " + assetInfos.ticker)
                                    $("#confirmSendBtn").attr("disabled", false)
                                } else {
                                    $("#confirmSendBtn").find("val").html("Insufficient " + MAIN_ASSET.ticker + " balance")
                                    $("#confirmSendBtn").attr("disabled", true)
                                }

                                $("#sendReviewNetFees").html(Utils.formatAmount(gasLimit * gasPrice, mainBal.decimals))
                                $("#sendReviewCost").html(totalNative)
                                $("#sendReviewCostTicker").html(MAIN_ASSET.ticker)
                            })

                        }

                        _this.gasLimit = fees.gasLimit
                        _this.gasPrice = fees.gasPrice

                        editFees.start(fees.gasLimit);
                        editFees.onGasChanged(fees.gasPrice, fees.gasLimit)

                        $("#sendConfirmFeesLoading").hide()
                        SendPane.feesForm.show()
                    })

                })
            })

        })

        SendPane.backBtn.click(function(){
            if($(this).attr("disabled")) return;
            SendPane.recipient.val("")
            SendPane.confirmForm.hide()
            SendPane.btnSubmit.attr("disabled", true)
            $("#sendAssetSelect").val('default').selectpicker("refresh");
            $('#amountSend').val("")
            $('#sendNextStep').attr("disabled", true)
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

            disableLoadBtn($(this))

            sendTo(SendPane.recipient.val(),
                SendPane.amount.val(),
                SendPane.select.val(),
                _this.gasLimit,
                _this.gasPrice)
                .then(function(res){
                    notyf.success("Transaction sent!")
                    SendPane.recipient.val("")
                    SendPane.amount.val(null)
                    SendPane.btnSubmit.attr("disabled", true)
                    $("#sendAssetSelect").val('default').selectpicker("refresh");
                    SendPane.confirmForm.hide()
                    SendPane.feesForm.hide()
                    $("#body .send .sendForm").show()
                    enableLoadBtn($("#confirmSendBtn"))
                })

        })

        SendPane.select.change(function(){
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
                SendPane.btnSubmit.attr("disabled", true)
                return
            }
            validateAddress(input.val()).then(function(res){
                SendPane.btnSubmit.attr("disabled", !res)
            })
        })

        SendPane.amount.on("input", function(){
            const max = parseFloat(SendPane.balance.html())
            const amount = parseFloat($(this).val())

            if(isNaN(amount) || amount == 0){
                $(this).removeClass("is-invalid")
                return
            }

            if(amount < 0 || amount > max){
                $(this).addClass("is-invalid")
                return
            }

            $(this).removeClass("is-invalid")
        })

        events.addListener("assetsChanged", function (data){
            _this.setSend(data)
        })

        events.addListener("addressChanged", () => {
            SendPane.recipient.val("")
            SendPane.amount.val("")
        })

    }

    setSend(data){
        SendPane.select.html("")
        SendPane.recipient.val("")
        SendPane.amount.val("")
        document.getElementById("showCost").innerHTML = "-"
        SendPane.backBtn.attr("disabled", false)
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

    async displayRecentRecipients(){
        let i = 0

        const container = document.getElementById("sendRecentElems")
        const sample = document.getElementById("sendRecentSample")
        const sampleContact = document.getElementById("sendRecentSampleContact")
        const notFound = document.getElementById("sendRecentNotfound")

        const added = []

        container.innerHTML = ""

        const contacts = await getContacts()
        const contactsByAddress = new Map()

        for(const contact of contacts){
            contactsByAddress.set(contact.address, contact)
        }

        for(const tx of MAIN_ASSET.transactions){
            if(i > 5) break
            if(added.includes(tx.recipient)) continue

            if(tx.contractAddr == MAIN_ASSET.ticker || await validateAddress(tx.contractAddr)){
                let elem

                if(contactsByAddress.has(tx.recipient)){
                    elem = sampleContact.cloneNode(true)
                    elem.querySelector(".contactName").innerHTML = contactsByAddress.get(tx.recipient).name
                }else{
                    elem = sample.cloneNode(true)
                }

                delete elem.id
                elem.querySelector(".textAddress").innerHTML = tx.recipient
                elem.querySelector("svg").dataset.jdenticonValue = tx.recipient
                elem.style.display = "block"

                elem.onclick = () => {
                    SendPane.recipient.val(tx.recipient)
                    SendPane.btnSubmit.click()
                }

                container.appendChild(elem)
                added.push(tx.recipient)
                i++
            }

        }

        if(i == 0)
            notFound.style.display = "block"
        else{
            jdenticon()
            notFound.style.display = "none"
        }

    }
}

const sendPane = new SendPane()
