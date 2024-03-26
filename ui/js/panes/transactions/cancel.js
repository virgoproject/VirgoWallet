class CancelTransaction extends StatefulElement {

    render() {
        const _this = this

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(baseInfosLoading) return ""

        const {data, loading} = this.useInterval(async () => {
            const gp = await getCancelGasPrice(_this.hash)
            const balance = await getBalance(baseInfos.wallets[baseInfos.selectedWallet].wallet.ticker)
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
                    <p id="title">Cancel transaction</p>
                    <p id="label" class="mb-0 text-sm">Cancel cost</p>
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
                cancelTransaction(data.hash, data.gasPrice).then(hash => {
                    notyf.success("Cancel request sent!")
                    _this.updateHash(hash)
                    _this.runIntervals()
                    _this.remove()
                })
                setSending(true)
            })

            button = `<button class="button w-100" onclick="${confirmClick}">Confirm</button>`
        }else{
            button = `<button class="button w-100" disabled>Insufficient ${baseInfos.wallets[baseInfos.selectedWallet].wallet.ticker} balance</button>`
        }

        return `
            <bottom-popup>
                <div class="text-center">
                    <p id="title">Cancel transaction</p>
                    <p id="label" class="mb-0 text-sm">Cancel cost</p>
                    <p id="amount">${Utils.formatAmount(newFee, baseInfos.wallets[baseInfos.selectedWallet].wallet.decimals)} <span id="ticker">${baseInfos.wallets[baseInfos.selectedWallet].wallet.ticker}</span></p>
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

Stateful.define("cancel-transaction", CancelTransaction)
