class ChainSelector extends StatefulElement {

    eventHandlers() {
        this.querySelector("#wrapper").classList.add("opened");
    }

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(loading) return ""

        const rows = []

        let i = 0
        for(let chain of data.wallets){
            chain = chain.wallet
            const chainClick = this.registerFunction(e => {
                browser.runtime.sendMessage({command: 'changeWallet', walletId: e.currentTarget.getAttribute("walletid")}).then(() => {
                    _this.removeWithAnimation()
                    setTimeout(() => {
                        _this.resetHome()
                    },250)
                })
            })

            rows.push(`
                <div class="chain mb-2 ${data.selectedWallet == i ? "selected" : "" } px-3" onclick="${chainClick}" walletid="${i}">
                    <div class="chainLeftWrapper">
                        <div class="chainLogo" style="background-image: url('${"https://raw.githubusercontent.com/virgoproject/tokens/main/" + chain.chainID + "/logo.png"}')"></div>
                        <p class="chainName">${chain.name}</p>
                    </div>
                    <i class="fa-regular ${data.selectedWallet == i ? "fa-check" : "fa-chevron-right" } text-xl chainRightIcon"></i>
                </div>
            `)
            i++
        }

        return `
            <div id="wrapper" class="px-3 pt-3">
                <scroll-view id="scroll">
                    ${rows}
                </scroll-view>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                height: calc(100% - 56px);
                width: 100%;
                top: 56px;
                position: absolute;
                background: white;
                transform: scaleY(0);
                transform-origin: 50% 0;
                transition: transform 0.25s ease;
            }
            
            #wrapper.opened {
                transform: scaleY(1);
            }
            
            .chain {
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
            
            .chain:hover {
                background: var(--gray-100);
            }
            
            .chain.selected {
                background: var(--gray-100);
                cursor: default;
            }
            
            .chainLeftWrapper {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: center;
            }
            
            .chainName {
                margin: 0;
                color: var(--gray-700);
                margin-left: 1em;
            }
            
            .chainLogo {
                height: 36px;
                width: 36px;
                background-size: cover;
                border-radius: 50%;
            }
            
            .chainRightIcon {
                padding-top: 4px;
                color: var(--gray-400);
            }
            
            #scroll {
                flex-grow: 1;
                min-height: 0;
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

Stateful.define("chain-selector", ChainSelector)
