class SpeedupTransaction extends StatefulElement {

    render() {
        const _this = this

        const {data, loading} = this.useInterval(async () => {
            const gp = await getSpeedupGasPrice(_this.hash)
            const balance = await getBalance(MAIN_ASSET.ticker)
            return {
                "hash": _this.hash,
                "gasPrice": gp.gasPrice,
                "gasLimit": gp.gasLimit,
                "value": gp.value,
                "balance": balance.balance
            }
        }, 10000)

        if(loading){
            return `
            <bottom-popup>
                <div class="text-center">
                    <p id="title">Speed up transaction</p>
                    <p id="label" class="mb-0 text-sm">New transaction fee</p>
                    <div class="shimmerBG" id="shimmerAmount"></div>    
                    <button class="button w-100" disabled>Confirm</button>
                </div>
            </bottom-popup>
            `
        }

        const [sending, setSending] = this.useState("loading", false)

        const newFee = new BN(data.gasPrice).mul(new BN(data.gasLimit))

        let button;

        if(sending){
            button = `<button class="button w-100" disabled><i class="fas fa-spinner fa-pulse"></i></button>`
        }else if(new BN(data.balance).gte(new BN(data.value).add(newFee))){
            const confirmClick = this.registerFunction(() => {
                speedUpTransaction(data.hash, data.gasPrice).then(hash => {
                    notyf.success("Transaction sped up!")
                    _this.updateHash(hash)
                    _this.runIntervals()
                    _this.remove()
                })
                setSending(true)
            })

            button = `<button class="button w-100" onclick="${confirmClick}">Confirm</button>`
        }else{
            button = `<button class="button w-100" disabled>Insufficient ${MAIN_ASSET.ticker} balance</button>`
        }

        return `
            <bottom-popup>
                <div class="text-center">
                    <p id="title">Speed up transaction</p>
                    <p id="label" class="mb-0 text-sm">New transaction fee</p>
                    <p id="amount">${Utils.formatAmount(newFee, MAIN_ASSET.decimals)} <span id="ticker">${MAIN_ASSET.ticker}</span></p>
                    ${button}
                </div>
            </bottom-popup>
        `
    }

    style() {
        return `
            #title {
                font-size: 1.25em;
            }
            
            #loading {
                font-size: 1.25em;
                text-align: center;
            }
            
            #label {
                color: var(--gray-400);
            }
            
            #shimmerAmount {
                border-radius: 0.5em;
                height: 1em;
                width: 16ch;
                margin: auto;
                margin-bottom: 1.5em;
                animation-duration: 15s;
            }
        `;
    }

}

Stateful.define("speedup-transaction", SpeedupTransaction)
