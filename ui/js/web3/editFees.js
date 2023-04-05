class EditFees extends HTMLElement {

    static gasPrice = 0
    static gasLimit = 0
    static feesModifier = 1
    static interval = null
    static onGasChanged = () => {}

    constructor() {
        super();

        this.setAttribute("id","editfees")

        this.innerHTML = `
        <div class="blackbg"></div>
        <div class="see p-4">
            <i class="fa-solid fa-horizontal-rule rule"></i>
            <div class="d-flex align-items-center mb-2 justify-content-center titleFees">
                <p>Edit Network Fees</p>
            </div>
            <div class="col-12 mb-4 speed slow text-left"  speed="slow">
                <div class="row">
                    <p class="label col-4">Slow</p>
                    <p class="value col-8 text-right" style="margin: 0;"><span class="editFeesSpeed " id="editFeesSlow">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed medium text-left" speed="medium">
                <div class="row">
                    <p class="label col-4">Medium</p>
                    <p class="value col-8 text-right" style="margin: 0;"><span class="editFeesSpeed" id="editFeesMedium">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed fast text-left" speed="fast">
                <div class="row">
                    <p class="label col-4">Fast</p>
                    <p class="value col-8 text-right" style="margin: 0;"><span class="editFeesSpeed" id="editFeesFast">-</span> <span class="feesTicker"></span></p>
                </div>
            </div>
            <div class="col-12 p-0">
                <button class="button w-100 saveFees" >Save</button>
            </div>
        </div>
    `;

        $(".blackbg").click(function (){
            $("#editfees").css("display", "none")
        })

        const _this = this

        $(".medium").addClass("selectedFees")

        $(".slow").click(function (){
            $(".slow").addClass("selectedFees")

            if ($(".medium .selectedFees")){
                $(".medium").removeClass("selectedFees")
            }

            if ($(".fast .selectedFees")){
                $(".fast").removeClass("selectedFees")
            }

            _this.onGasChanged(_this.gasPrice,_this.gasLimit)
        })

        $(".medium").click(function (){
            $(".medium").addClass("selectedFees")

            if ($(".slow .selectedFees")){
                $(".slow").removeClass("selectedFees")
            }

            if ($(".fast .selectedFees")){
                $(".fast").removeClass("selectedFees")
            }

            _this.onGasChanged(_this.gasPrice,_this.gasLimit)
        })


        $(".fast").click(function (){
            $(".fast").addClass("selectedFees")

            if  ($(".medium .selectedFees")){
                $(".medium").removeClass("selectedFees")
            }

            if ($(".slow .selectedFees")){
                $(".slow").removeClass("selectedFees")
            }

            _this.onGasChanged(_this.gasPrice,_this.gasLimit)
        })


        $(".saveFees").click(function (){
            $("#editfees").css("display", "none")
            $("#swapReview").css("display", "block")

            _this.onGasChanged(_this.gasPrice,_this.gasLimit)
        })
    }

    start(gasLimit){
        this.querySelector(".feesTicker").innerHTML = MAIN_ASSET.ticker
        this.gasPrice = 0
        this.gasLimit = gasLimit
        this.setFees(gasLimit)

        if(this.interval !== null){
            clearInterval(this.interval)
            this.interval = null
        }

        this.interval = setInterval(() =>{
            this.setFees(gasLimit)
        },5000)
    }

    setFees(gasLimit){
        const _this = this
        getGasPrice().then(function (res) {
            if(_this.gasPrice == res) return

            let finalGasPriceSlow = Math.round(res * 0.8)
            let finalGasPriceMedium = Math.round(res * 1)
            let finalGasPriceFast = Math.round(res * 1.2)

            $("#editFeesSlow").html(Utils.formatAmount(gasLimit * finalGasPriceSlow, MAIN_ASSET.decimals))
            $("#editFeesMedium").html(Utils.formatAmount(gasLimit * finalGasPriceMedium, MAIN_ASSET.decimals))
            $("#editFeesFast").html(Utils.formatAmount(gasLimit * finalGasPriceFast, MAIN_ASSET.decimals))

            _this.gasPrice = res
            _this.onGasChanged(_this.gasPrice, gasLimit)
        })
    }

    getGasPrice(){
        const _this = this
            let elem = $(".selectedFees").attr("speed")

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
