class SendTokenConfirm extends StatefulElement {

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const baseInfos = await getBaseInfos()
            const contacts = await getContacts()

            const contactsByAddress = {}

            for(const contact of contacts){
                contactsByAddress[contact.address.toLowerCase()] = contact
            }

            for(const account of baseInfos.addresses){
                contactsByAddress[account.address.toLowerCase()] = {
                    address: account.address,
                    name: account.name
                }
            }

            const fees = await estimateSendFees(_this.address, Utils.toAtomicString(_this.amount, _this.token.decimals), _this.token.contract)

            return {
                baseInfos,
                contactsByAddress,
                fees
            }
        })

        if(loading) return ""

        const wallet = data.baseInfos.wallets[data.baseInfos.selectedWallet].wallet

        const {data: balance, loading: balanceLoading} = this.useInterval(async () => {
            return {
                token: await getBalanceCross(wallet.chainID, _this.token.contract),
                native: await getBalanceCross(wallet.chainID, wallet.ticker)
            }
        }, 10000)

        if(balanceLoading) return ""

        const [gasPrice, setGasPrice] = this.useState("gasPrice", data.fees.gasPrice)
        const [gasLimit, setGasLimit] = this.useState("gasLimit", data.fees.gasLimit)

        const back = this.registerFunction(() => {
            _this.remove()
        })

        if(this.feesEditor === undefined){
            this.feesEditor = EditFeesNew.init(gasLimit, setGasPrice, data.baseInfos)
        }

        const editFeesClick = this.registerFunction(() => {
            _this.feesEditor.show()
        })

        let nativeTotal = Number(Utils.formatAmount(gasLimit*gasPrice, wallet.decimals))

        if(_this.token.contract == wallet.ticker)
            nativeTotal = nativeTotal + Number(_this.amount)

        const btnDisabled = nativeTotal > Number(Utils.formatAmount(balance.native.balance, balance.native.decimals)) || Number(_this.amount) > Number(Utils.formatAmount(balance.token.balance, balance.token.decimals))

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Confirm" backfunc="${back}"></section-header>
                    <div id="content" class="px-3">
                        <p class="text-lg mb-0 mt-3" id="amountTitle">Amount</p>
                        <div id="amountWrapper" class="text-3xl">
                           <p id="amount">${_this.amount}</p>
                           <p id="amountSymbol"> ${_this.token.ticker}</p> 
                        </div>
                        <p class="text-left mb-0 label mt-3">From</p>
                        ${this.getContact(data, data.baseInfos.addresses[data.baseInfos.selectedAddress].address)}
                        <p class="text-left mb-0 label mt-3">To</p>
                        ${this.getContact(data, _this.address)}
                        <div id="feesWrapper" class="mt-4">
                            <div class="feesRow mb-2">
                                <p class="feesTitle">Fees<span id="editFees" onclick="${editFeesClick}">Edit</span></p>
                                <div class="feesAmountWrapper">
                                    <p class="feesAmount">${Utils.formatAmount(gasLimit*gasPrice, wallet.decimals)}</p>
                                    <p> ${wallet.ticker}</p>
                                </div>
                            </div>
                            <div class="feesRow">
                                <p class="feesTitle">Total</p>
                                <div class="feesAmountWrapper">
                                    <p class="feesAmount">${nativeTotal}</p>
                                    <p> ${wallet.ticker}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-3">
                        <button class="button w-100" id="next" ${btnDisabled ? "disabled" : ""}>Confirm</button>              
                    </div>
                </div>
            </div>
        `;
    }

    getContact(data, address){
        let contact = {
            address: address
        }

        if(data.contactsByAddress[address.toLowerCase()] !== undefined)
            contact = data.contactsByAddress[address.toLowerCase()]

        if(contact.name !== undefined){
            return `
                <div class="contact mb-2 px-2 text-left">
                    <div class="contactWrapper">
                        <div class="contactLogo">${jdenticon.toSvg(contact.address, 36)}</div>
                        <div class="contactText">
                            <p class="contactName">${contact.name}</p>
                            <p class="contactAddress text-sm">${contact.address}</p>
                        </div>
                    </div>
                </div>
            `
        }else{
            return `
                <div class="contact mb-2 px-2 text-left">
                    <div class="contactWrapper">
                        <div class="contactLogo">${jdenticon.toSvg(contact.address, 36)}</div>
                        <div class="contactText">
                            <p class="contactName">${contact.address}</p>
                        </div>
                    </div>
                </div>
            `
        }
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #content {
                flex-grow: 1;
                min-height: 0;
                text-align: center;
            }
            
            #amountWrapper {
                display: flex;
                justify-content: center;
                white-space: pre;
                width: 100%;
                flex-wrap: nowrap;
                color: var(--gray-700);
            }
            
            #amountTitle {
                color: var(--gray-400);
            }
            
            #amount {
                margin: 0px;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #amountSymbol {
                margin: 0;
            }
            
            .contact {
                display: flex;
                padding: 0.75em 0px;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                border-radius: 0.5em;
            }
            
            .contactWrapper {
                display: flex;
                flex-flow: row;
                align-items: center;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                width: 100%;
            }
            
            .contactText {
                margin-left: 1em;
                flex: 1;
                min-width: 0;
                overflow: hidden;
            }
            
            .contactName {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .contactLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                overflow: hidden;
            }
            
            .contactAddress {
                margin: 0;
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            #feesWrapper {
                background-color: var(--gray-50);
                padding: 1em;
                border-radius: 0.5em;
                color: var(--gray-700);
            }
            
            #feesWrapper p {
                margin-bottom: 0;
                font-weight: 600;
            }
            
            .feesRow {
                display: flex;
                justify-content: space-between;
            }
            
            .feesTitle {
                min-width: fit-content;
                margin-right: 1em;
                color: var(--gray-400);
                font-weight: 500!important;
            }
            
            .feesAmountWrapper {
                display: flex;
                white-space: pre;
                min-width: 0;
            }
            
            .feesAmount {
                min-width: 0px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            #editFees {
                color: var(--mainColor);
                cursor: pointer;
                margin-left: 1em;
                font-weight: 600;
            }
        `;
    }

}

Stateful.define("send-token-confirm", SendTokenConfirm)
