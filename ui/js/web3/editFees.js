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

        $(this).find(".see").click(event => {
            event.stopPropagation()
        })

        $(this).click(() => {
            $(this).hide()
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

            try {
                _this.onGasChanged(_this.getGasPrice(),_this.gasLimit)
            }catch(e){}
        })

        $(".medium").click(function (){
            $(".medium").addClass("selectedFees")

            if ($(".slow .selectedFees")){
                $(".slow").removeClass("selectedFees")
            }

            if ($(".fast .selectedFees")){
                $(".fast").removeClass("selectedFees")
            }

            try {
                _this.onGasChanged(_this.getGasPrice(),_this.gasLimit)
            }catch(e){}
        })


        $(".fast").click(function (){
            $(".fast").addClass("selectedFees")

            if  ($(".medium .selectedFees")){
                $(".medium").removeClass("selectedFees")
            }

            if ($(".slow .selectedFees")){
                $(".slow").removeClass("selectedFees")
            }

            try {
                _this.onGasChanged(_this.getGasPrice(),_this.gasLimit)
            }catch(e){}
        })


        $(".saveFees").click(function (){
            $("#editfees").css("display", "none")
            $("#swapReview").css("display", "block")

            try {
                _this.onGasChanged(_this.getGasPrice(),_this.gasLimit)
            }catch(e){}
        })
    }

    start(gasLimit){
        this.querySelectorAll(".feesTicker").forEach(elem => {
            getBaseInfos().then(function (info){
                elem.innerHTML = info.wallets[info.selectedWallet].wallet.ticker
            })
        })

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

            getBaseInfos().then(function (info){
                $("#editFeesSlow").html(Utils.formatAmount(gasLimit * finalGasPriceSlow, info.wallets[info.selectedWallet].wallet.decimals))
                $("#editFeesMedium").html(Utils.formatAmount(gasLimit * finalGasPriceMedium, info.wallets[info.selectedWallet].wallet.decimals))
                $("#editFeesFast").html(Utils.formatAmount(gasLimit * finalGasPriceFast, info.wallets[info.selectedWallet].wallet.decimals))
            })

            _this.gasPrice = res

            try {
                _this.onGasChanged(_this.getGasPrice(), gasLimit)
            }catch(e){}

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
