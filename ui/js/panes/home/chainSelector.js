class ChainSelector extends StatefulElement {

    eventHandlers() {
        this.querySelector("#wrapper").classList.add("opened");

        for(const elem of this.querySelectorAll(".chain")){
            const logo = elem.querySelector(".chainLogo")
            const chainid = elem.getAttribute("chainid")

            logo.onload = e => {
                e.target.style.display = "initial"
                elem.querySelector(".shimmerBG").style.display = "none"
            }
            logo.onerror = e => {
                elem.querySelector(".defaultLogo").style.display = "flex"
                elem.querySelector(".shimmerBG").style.display = "none"
            }

            logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chainid + "/logo.png"
        }
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

            if(!chain.tracked) continue

            const chainClick = this.registerFunction(e => {

                const wallet = data.selectedWallet

                browser.runtime.sendMessage({command: 'changeWallet', walletId: e.currentTarget.getAttribute("walletid")}).then(() => {
                    const interval = setInterval(() => {
                        getBaseInfos().then(infos => {
                            if(infos.selectedWallet != wallet){
                                _this.resetHome()
                                clearInterval(interval)
                            }
                        })
                    }, 50)
                })
            })

            rows.push(`
                <div class="chain mb-2 ${data.selectedWallet == i ? "selected" : "" } px-3" onclick="${chainClick}" walletid="${i}" chainid="${chain.chainID}">
                    <div class="chainLeftWrapper">
                        <div class="shimmerBG"></div>
                        <div class="defaultLogo" style="display: none"><p class="m-auto">${chain.name.charAt(0).toUpperCase()}</p></div>
                        <img class="chainLogo" style="display: none">
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
            
            .chainLogo, .shimmerBG {
                height: 36px;
                width: 36px;
                background-size: cover;
                border-radius: 50%;
                animation-duration: 35s;
            }
            
            .defaultLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
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
        this.deleting = true
        this.querySelector("#wrapper").classList.remove("opened");
        setTimeout(() => {
            _this.remove()
        }, 250)
    }

}

Stateful.define("chain-selector", ChainSelector)
