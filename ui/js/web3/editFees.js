class EditFees extends HTMLElement {

    static gasPrice = 0
    static feesModifier = 1
    static interval = null
    static onGasChanged = () => {}
    static onBalance = () => {}

    constructor() {
        super();


        this.setAttribute("id","editfees")



        $(".editFees").click(function (){
            getGasPrice().then(function(gasPrice) {
                $("#editfees").show()
                $("#swapReview").css("display", "none")
                let finalGasPriceSlow;
                finalGasPriceSlow = Math.round(gasPrice * 0.8)
                let finalGasPriceMedium;
                finalGasPriceMedium = Math.round(gasPrice * 1)
                let finalGasPriceFast;
                finalGasPriceFast = Math.round(gasPrice * 1.2)

                let dec = parseInt(document.querySelector("edit-fees").dataset.decimal)
                let lim = parseInt(document.querySelector("edit-fees").dataset.limit)
                let ticker = parseInt(document.querySelector("edit-fees").dataset.tick)




                $("#editFeesSlow").html(Utils.formatAmount(lim * finalGasPriceSlow, dec))
                $("#editFeesMedium").html(Utils.formatAmount(lim * finalGasPriceMedium, dec))
                $("#editFeesFast").html(Utils.formatAmount(lim * finalGasPriceFast, dec))
            })
        })


        this.innerHTML = `
        <div class="blackbg"></div>
        <div class="see p-4">
            <i class="fa-solid fa-horizontal-rule rule"></i>
            <div class=" d-flex align-items-center mb-2 justify-content-center titleFees">
                <p class="col-6">Edit Network Fees</p>
            </div>
            <div class="col-12 mb-4 speed slow text-left"  speed="slow">
                <div class="row">
                    <p class="label  col-4">Slow</p>
                    <p class="value col-6 text-right" style="margin: 0;padding: 0"><span id="editFeesSlow">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed medium text-left" speed="medium">
                <div class="row">
                    <p class="label  col-4">Medium</p>
                    <p class="value col-6 text-right" style="margin: 0;padding: 0"><span id="editFeesMedium">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed fast text-left" speed="fast">
                <div class="row">
                    <p class="label  col-4">Fast</p>
                    <p class="value col-6 text-right" style="margin: 0;padding: 0"><span id="editFeesFast">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 p-0">
                <button class="button w-100 saveFees" >Save</button>
            </div>
        </div>
    `;

        $(".blackbg").click(function (){
            $("#editfees").css("display", "none")
            $("#swapReview").css("display", "block")
        })

        const _this = this

        $(".medium").addClass("selecteded")

        $(".slow").click(function (){
            $(".slow").addClass("selecteded")
            let elem = this.getAttribute("speed")

            if ($(".medium .selecteded")){
                $(".medium").removeClass("selecteded")
            }

            if ($(".fast .selecteded")){
                $(".fast").removeClass("selecteded")
            }
            _this.onGasChanged()
        })

        $(".medium").click(function (){
            $(".medium").addClass("selecteded")

            if ($(".slow .selecteded")){
                $(".slow").removeClass("selecteded")
            }

            if ($(".fast .selecteded")){
                $(".fast").removeClass("selecteded")
            }
            _this.onGasChanged()
        })


        $(".fast").click(function (){
            $(".fast").addClass("selecteded")

            if  ($(".medium .selecteded")){
                $(".medium").removeClass("selecteded")
            }

            if ($(".slow .selecteded")){
                $(".slow").removeClass("selecteded")
            }
            _this.onGasChanged()
        })


        $(".saveFees").click(function (){
            $("#editfees").css("display", "none")
            $("#swapReview").css("display", "block")
        })
    }

    start(gasLimit){
        this.setFees(gasLimit)
        this.interval = setInterval(() =>{
            this.setFees(gasLimit)
        },500)
    }

    setFees(gasLimit){
        const _this = this

        getBalance("BNB").then(function(balance) {
            getGasPrice().then(function (res) {
                _this.gasPrice = res
                let finalGasPrice
                finalGasPrice = Math.round( _this.gasPrice * _this.feesModifier)

                let nativeTotal = gasLimit * finalGasPrice

                if(nativeTotal <= balance.balance)
                    _this.onBalance()

                _this.onGasChanged()
            })
        })

    }

    getGas(){
        const _this = this
            let elem = $(".selecteded").attr("speed")

            switch (elem) {
                case "slow" :
                    _this.feesModifier = 0.8
                    return Math.round(0.8 * _this.gasPrice)
                    break
                case "medium" :
                    _this.feesModifier = 1
                    return Math.round(1 * _this.gasPrice)
                    break
                case "fast" :
                    _this.feesModifier = 1.2
                    return Math.round(1.2 * _this.gasPrice)
                    break
            }
    }
}

window.customElements.define('edit-fees', EditFees);
