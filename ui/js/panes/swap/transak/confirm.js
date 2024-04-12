class TransakConfirm extends StatefulElement {

    eventHandlers() {
        if(this.email === undefined || this.msgHandler !== undefined) return

        const _this = this

        this.msgHandler = (message) => {
            console.log(message.source)

            // To get all the events
            console.log('Event ID: ', message?.data?.event_id);
            console.log('Data: ', message?.data?.data);

            // This will trigger when the user marks payment is made
            if (message?.data?.event_id === 'TRANSAK_WIDGET_CLOSE') {
                window.removeEventListener("message", this.msgHandler)
                _this.remove()
                return
            }

            if(message?.data?.event_id === "TRANSAK_ORDER_SUCCESSFUL"){
                createTransakOrder(_this.tokenIn, _this.tokenOut, _this.amountIn, _this.route, message.data.data.id)

                const elem = document.createElement("transak-confirmed")
                document.body.appendChild(elem)

                _this.remove()
                return
            }

        }

        window.addEventListener('message', this.msgHandler)
    }

    render() {
        const _this = this

        let title = "Buy " + this.tokenOut.ticker
        if(this.tokenOut.chainID == "FIAT")
            title = "Sell " + this.tokenIn.ticker

        const [step, setStep] = this.useState("step", 0)

        const back = this.registerFunction(() => {
            if(step == 0){
                _this.remove()
                return
            }
            setStep(step-1)
        })

        let content = null;
        if(step == 0) content = this.step0(setStep)
        if(step == 1) content = this.step1(setStep)
        if(step == 2) content = this.step2()

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="${title}" backfunc="${back}"></section-header>
                    ${content}
                </div>
            </div>
        `;
    }

    step0(setStep){

        const [selected, setSelected] = this.useState("selected", 0)

        let methods = []

        const selectClick = this.registerFunction(e => {
            setSelected(e.currentTarget.getAttribute("index"))
        })

        const nextclick = this.registerFunction(() => {
            setStep(1)
        })

        let i = 0;
        for(const method of this.route.routes[0].paymentMethods){
            if((method.id == "apple_pay" || method.id == "google_pay")) continue
            methods.push(`
                <tr class="method ${i == selected ? "selected" : ""}" onclick="${selectClick}" index=${i}>
                    <td class="imgWrapper">
                        <img src="${method.icon}">
                    </td>
                    <td class="text-left pl-2 textWrapper">
                        <p class="name text-gray-700">${method.name}</p>
                        <p class="processingTime text-sm text-gray-400">${method.processingTime}</p>
                    </td>
                </tr>
            `)
            i++
        }

        return `
            <div id="content" class="px-3">
                <p class="text-left mb-0 label mt-3 text-sm">Payment method</p>
                <table>
                    <tbody>
                        ${methods}
                    </tbody>
                </table>
            </div>
            <div class="p-3">
                 <button class="button w-100" onclick="${nextclick}">Next</button>
            </div>
        `
    }

    step1(setStep){
        const _this = this

        const {data: mailAddress, loading} = this.useFunction(async () => {
            return await getMailAddress()
        })

        if(loading) return ""

        const onInput = this.registerFunction(e => {
            const btn = _this.querySelector("#next")
            btn.disabled = !(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(e.currentTarget.value))
        })

        const nextClick = this.registerFunction(() => {
            _this.email = this.querySelector("#input").value
            setMailAddress(_this.email)
            setStep(2)
        })

        const onKeyDown = this.registerFunction(e => {
            if(e.which != 13) return
            const target = _this.querySelector("#next")
            if(target.disabled) return
            target.onclick()
        })

        return `
            <div id="content" class="px-3">
                <p class="text-left mb-0 label mt-3 text-sm">Mail address</p>
                <input type="email" class="input w-100" placeholder="satoshi@gmail.com" oninput="${onInput}" id="input" ${mailAddress? `value="${mailAddress}"` : ""} onkeydown="${onKeyDown}">
            </div>
            <div class="p-3">
                 <button class="button w-100" id="next" ${mailAddress? "" : "disabled"} onclick="${nextClick}">Next</button>
            </div>
        `
    }

    step2(){
        const [selected, setSelected] = this.useState("selected", 0)

        const params = this.route.routes[0]

        const {data: address, loading} = this.useFunction(async () => {
            const baseInfos = await getBaseInfos()
            return baseInfos.addresses[baseInfos.selectedAddress].address
        })

        if(loading) return ""

        return `
            <div id="content">
                <iframe
                    id="transakIframe"
                    src="https://global-stg.transak.com/?apiKey=d568fc2b-477e-46b3-9442-0affd05bbb83&environment=STAGING&productsAvailed=BUY&fiatAmount=${params.fiatAmount}&fiatCurrency=${params.fiatCurrency}&network=${params.network}&paymentMethod=${params.paymentMethods[selected].id}&cryptoCurrencyCode=${params.cryptoCurrency}&isFeeCalculationHidden=true&hideExchangeScreen=true&walletAddress=${address}&disableWalletAddressForm=true&email=${this.email}&hideMenu=true&themeColor=aa3180"
                    allow="camera;microphone;payment"
                </iframe>
            </div>
        `
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
            
            table {
                border-collapse: separate !important;
                border-spacing: 0px 1em;
                width: 100%;
            }
            
            .method {
                padding: 0 0.5em;
                cursor: pointer;
            }
            
            .imgWrapper {
                width: 1%;
                padding: 1em;
                border-top-left-radius: 0.5em;
                border-bottom-left-radius: 0.5em;
            }
            
            .method:hover .imgWrapper {
                background: var(--gray-50);
            }
            
            .method.selected .imgWrapper {
                background: var(--gray-100);
            }
            
            .method img {
                height: 24px;
            }
            
            .textWrapper {
                border-bottom-right-radius: 0.5em;
                border-top-right-radius: 0.5em;
            }
            
            .method:hover .textWrapper {
                background: var(--gray-50);
            }
            
            .method.selected .textWrapper {
                background: var(--gray-100);
            }
            
            .method p {
                margin: 0;
                user-select: none;
            }
            
            #transakIframe {
                position: unset;
                height: 100%;
                width: 100%;
                color-scheme: light;
            }
            
            :root {
              color-scheme: light dark;
            }
        `;
    }

}

Stateful.define("transak-confirm", TransakConfirm)
