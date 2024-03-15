class AccountSelector extends StatefulElement {

    eventHandlers() {
        this.querySelector("#wrapper").classList.add("opened");
        if(this.skipAnimation){
            this.querySelector("#scroll").toBottom()
        }
    }

    async render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(loading) return ""

        const selectedWallet = data.wallets[data.selectedWallet].wallet

        const settingsClick = this.registerFunction(() => {
            const elem = document.createElement("settings-menu")
            document.body.appendChild(elem)
        })

        const rows = []

        let i = 0
        for(const account of data.addresses){

            const accountClick = this.registerFunction(e => {
                changeAccount(e.currentTarget.getAttribute("addressid")).then(() => {
                    _this.removeWithAnimation()
                    setTimeout(() => {
                        _this.resetHome()
                    },250)
                })
            })

            rows.push(`
                <div class="account mb-2 ${data.selectedAddress == i ? "selected" : "" } px-3" addressid="${i}" onclick="${accountClick}">
                    <div class="accountWrapper">
                        <div class="accountLogo">${jdenticon.toSvg(account.address, 36)}</div>
                        <div class="accountText">
                            <p class="accountName">${account.name}</p>
                            <p class="accountValue text-sm"><span class="val">${Utils.formatAmount(account.balances[selectedWallet.ticker].balance, selectedWallet.decimals)}</span><span> ${selectedWallet.ticker}</span></p>
                        </div>
                        <i class="fa-regular ${data.selectedAddress == i ? "fa-check" : "fa-chevron-right" } text-xl accountRightIcon"></i>
                    </div>
                </div>
            `)
            i++
        }

        const addAccountClick = this.registerFunction(() => {
            addAccount().then(() => {
                _this.skipAnimation = true
                _this.runFunctions()
            })
        })

        return `
            <div id="wrapper" ${this.skipAnimation ? "class='opened'" : ""}>
                <section-header title="My accounts" righticon="fa-duotone fa-gear" rightclick="${settingsClick}"></section-header>
                <scroll-view id="scroll" class="px-3 pt-3">
                    ${rows}
                </scroll-view>
                <div class="p-3">
                    <button class="button w-100" onclick="${addAccountClick}">Add an account</button>              
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                top: 0;
                position: absolute;
                background: white;
                transform: scaleY(0);
                transform-origin: 50% 0;
                transition: transform 0.25s ease;
            }
            
            #wrapper.opened {
                transform: scaleY(1);
            }
            
            #scroll {
                flex-grow: 1;
                min-height: 0;
            }
            
            .account {
                display: flex;
                padding: 0.75em 0px;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s ease-in;
                border-radius: 0.5em;
            }
            
            .account:hover {
                background: var(--gray-100);
            }
            
            .account.selected {
                background: var(--gray-100);
                cursor: default;
            }
            
            .accountWrapper {
                display: flex;
                flex-flow: row;
                align-items: center;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                width: 100%;
            }
            
            .accountText {
                margin-left: 1em;
                flex: 1;
                min-width: 0;
                overflow: hidden;
                margin-right: 1em;
            }
            
            .accountName {
                margin: 0;
                color: var(--gray-700);
                font-weight: 600;
            }
            
            .accountLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                overflow: hidden;
            }
            
            .accountRightIcon {
                padding-top: 4px;
                color: var(--gray-400);
            }
            
            .accountValue {
                margin: 0;
                color: var(--gray-400);
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                white-space: pre-wrap;
            }
            
            .accountValue .val {
                text-overflow: ellipsis;
                min-width: 0px;
                overflow: hidden;
            }
        `;
    }

    removeWithAnimation(){
        const _this = this
        this.querySelector("#wrapper").classList.remove("opened");
        setTimeout(() => {
            _this.remove()
        }, 250)
    }

}

Stateful.define("account-selector", AccountSelector)
