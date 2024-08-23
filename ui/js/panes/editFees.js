class EditFeesNew extends StatefulElement {

    static init(gasLimit, setGasPrice, baseInfos){
        const feesEditor = document.createElement("edit-fees-new")

        feesEditor.gasLimit = gasLimit
        feesEditor.setGasPrice = setGasPrice
        feesEditor.baseInfos = baseInfos

        document.body.appendChild(feesEditor)

        return feesEditor
    }

    show(){
        this.setDisplay(true)
    }

    async render() {

        let wallet
        if(this.baseInfos.ticker !== undefined)
            wallet = this.baseInfos
        else
            wallet = this.baseInfos.wallets[this.baseInfos.selectedWallet].wallet

        const [selected, setSelected] = this.useState("selected", 1)

        const {data: gasPrice, loading} = this.useInterval(async () => {
            return await getGasPrice(wallet.chainID)
        }, 5000)

        const [display, setDisplay] = this.useState("display", false)

        this.setDisplay = setDisplay

        const onClose = this.registerFunction(() => {
            setDisplay(false)
        })

        if(loading){
            if(display) return `
                <bottom-popup prevent-remove onclose="${onClose}">
                    <section-header title="${Stateful.t("editFeesTitle")}" no-padding></section-header>
                    <div class="optionShimmer mb-2 mt-3 shimmerBG"></div>
                    <div class="optionShimmer mb-2 shimmerBG"></div>
                    <div class="optionShimmer mb-2 shimmerBG"></div>
                    <button class="button w-100 mt-3" disabled>${Stateful.t("editFeesSaveBtn")}</button>
                </bottom-popup>
            `

            return ""
        }

        let selectedGasPrice = new BN(gasPrice)
        if(selected == 0)
            selectedGasPrice = selectedGasPrice.mul(new BN("80")).div(new BN("100"))
        else if(selected == 2)
            selectedGasPrice = selectedGasPrice.mul(new BN("120")).div(new BN("100"))

        this.setGasPrice(selectedGasPrice.toString())

        if(!display) return ""

        const optionClick = this.registerFunction(e => {
            if(e.currentTarget.classList.contains("selected")) return
            setSelected(Number.parseInt(e.currentTarget.id))
        })

        return `
            <bottom-popup prevent-remove onclose="${onClose}">
                <section-header title="${Stateful.t("editFeesTitle")}" no-padding></section-header>
                <div class="option mb-2 mt-3 ${selected == 0 ? "selected" : ""}" id="0" onclick="${optionClick}">
                    <p class="optionTitle">${Stateful.t("editFeesSlowLabel")}</p>
                    <div class="amountWrapper">
                        <p class="amount">${Utils.formatAmount(new BN(gasPrice).mul(new BN("80")).div(new BN("100")).mul(new BN(this.gasLimit)).toString(), wallet.decimals)}</p>
                        <p class="symbol"> ${wallet.ticker}</p>
                    </div>
                </div>
                <div class="option mb-2 ${selected == 1 ? "selected" : ""}" id="1" onclick="${optionClick}">
                    <p class="optionTitle">${Stateful.t("editFeesMediumLabel")}</p>
                    <div class="amountWrapper">
                        <p class="amount">${Utils.formatAmount(new BN(gasPrice).mul(new BN(this.gasLimit)).toString(), wallet.decimals)}</p>
                        <p class="symbol"> ${wallet.ticker}</p>
                    </div>
                </div>
                <div class="option mb-2 ${selected == 2 ? "selected" : ""}" id="2" onclick="${optionClick}">
                    <p class="optionTitle">${Stateful.t("editFeesFastLabel")}</p>
                    <div class="amountWrapper">
                        <p class="amount">${Utils.formatAmount(new BN(gasPrice).mul(new BN("120")).div(new BN("100")).mul(new BN(this.gasLimit)).toString(), wallet.decimals)}</p>
                        <p class="symbol"> ${wallet.ticker}</p>
                    </div>
                </div>
                <button class="button w-100 mt-3" onclick="${onClose}">${Stateful.t("editFeesSaveBtn")}</button>
            </bottom-popup>
        `;
    }

    style() {
        return `
            .option {
                display: flex;
                justify-content: space-between;
                padding: 1em;
                border-radius: 0.5em;
                background-color: transparent;
                transition: all 0.1s ease-in;
                cursor: pointer;
                color: var(--gray-400);
            }
            
            .option:hover {
                background-color: var(--gray-50);
            }
            
            .option.selected {
                background-color: var(--gray-100);
                color: var(--mainColor);
                cursor: default;
                font-weight: 600;
            }
            
            .option p {
                margin: 0;
            }
            
            .optionTitle {
                min-width: fit-content;
                padding-right: 1em;
            }
            
            .amountWrapper {
                display: flex;
                white-space: pre;
                min-width: 0;
            }
            
            .amount {
                min-width: 0px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .optionShimmer {
                height: 49px;
                border-radius: 0.5em;
            }
        `;
    }

}

Stateful.define("edit-fees-new", EditFeesNew)
