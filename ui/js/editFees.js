class EditFees extends HTMLElement {

    static gasPrice = 0
    static feesModifier = 1
    static interval = null

    constructor() {
        super();

        this.style.margin = 0;
        this.style.padding = 0;
        this.setAttribute("id","editfees")

        $(".editFees").click(function (){
            getGasPrice().then(function(gasPrice) {
                $("#editFees").css("display", "block")
                let finalGasPriceSlow;
                finalGasPriceSlow = Math.round(gasPrice * 0.8)
                let finalGasPriceMedium;
                finalGasPriceMedium = Math.round(gasPrice * 1)
                let finalGasPriceFast;
                finalGasPriceFast = Math.round(gasPrice * 1.2)

                $("#editFeesSlow").html(Utils.formatAmount(gas * finalGasPriceSlow, decimals))
                $("#editFeesMedium").html(Utils.formatAmount(gas * finalGasPriceMedium, decimals))
                $("#editFeesFast").html(Utils.formatAmount(gas * finalGasPriceFast, decimals))
            })
        })


        this.innerHTML = `
        <div class="blackbg"></div>
        <div class="see p-4">
            <i class="fa-solid fa-horizontal-rule rule"></i>
            <div class=" d-flex align-items-center mb-2 justify-content-center title">
                <p class="col-6">Edit Network Fees</p>
            </div>
            <div class="col-12 mb-4 speed slow text-left"  speed="slow">
                <div class="row">
                    <p class="label  col-5">Slow</p>
                    <p class="value col-5 text-right" style="margin: 0;padding: 0"><span id="editFeesSlow">-</span> <span id="editFeesTickerSlow"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed medium text-left" speed="medium">
                <div class="row">
                    <p class="label  col-5">Medium</p>
                    <p class="value col-5 text-right" style="margin: 0;padding: 0"><span id="editFeesMedium">-</span> <span id="editFeesTickerMedium"></span></p>
                </div>
            </div>
            <div class="col-12 mb-4 speed fast text-left" speed="fast">
                <div class="row">
                    <p class="label  col-5">Fast</p>
                    <p class="value col-5 text-right" style="margin: 0;padding: 0"><span id="editFeesFast">-</span> <span id="editFeesTickerFast"></span></p>
                </div>
            </div>
            <div class="col-12 p-0">
                <button class="button w-100 saveFees" >Save</button>
            </div>
        </div>
    `;


        $(".medium").addClass("selected")

        $(".slow").click(function (){
            $(".slow").addClass("selected")
            let elem = this.getAttribute("speed")

            if ($(".medium .selected")){
                $(".medium").removeClass("selected")
            }

            if ($(".fast .selected")){
                $(".fast").removeClass("selected")
            }
        })

        $(".medium").click(function (){
            $(".medium").addClass("selected")

            if ($(".slow .selected")){
                $(".slow").removeClass("selected")
            }

            if ($(".fast .selected")){
                $(".fast").removeClass("selected")
            }
        })


        $(".fast").click(function (){
            $(".fast").addClass("selected")

            if  ($(".medium .selected")){
                $(".medium").removeClass("selected")
            }

            if ($(".slow .selected")){
                $(".slow").removeClass("selected")
            }
        })


        $(".saveFees").click(function (){
            $("#editFees").css("display", "none")
        })
    }

    start(gasLimit,Price){
    const _this = this
        this.interval = setInterval(() =>{
            _this.gasPrice = Price
            finalGasPrice = Math.round(Price * _this.feesModifier)
            $("#fees").html(Utils.formatAmount(gasLimit * finalGasPrice, decimals))

        },5000)
    }

    getGas(){
        const _this = this
            let elem = $(".selected").attr("speed")

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