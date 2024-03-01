class HomeHeader extends StatefulElement {

    eventHandlers() {
        if(!this.data) return
        this.querySelector("#icon").innerHTML = jdenticon.toSvg(this.data.addresses[this.data.selectedAddress].address, 32)
    }

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(loading){
            return ``
        }

        this.data = data

        const selectedWallet = data.wallets[data.selectedWallet].wallet

        const historyClick = this.registerFunction(() => {
            const elem = document.createElement("transactions-pane")
            document.body.appendChild(elem)
        })

        let chainSelector = false
        const chainClick = this.registerFunction(() => {
            if(!chainSelector){
                chainSelector = document.createElement("chain-selector")
                chainSelector.resetHome = () => {
                    _this.runFunctions()
                }
                document.body.appendChild(chainSelector)
                this.querySelector("#chainNameIcon").classList.add("opened")
            }else{
                chainSelector.removeWithAnimation()
                chainSelector = false
                this.querySelector("#chainNameIcon").classList.remove("opened")
            }
        })

        return `
            <div id="header">
                <div id="accountBtn">
                    <svg width="32" height="32" id="icon"></svg>
                    <div id="paramsIcon">
                        <i class="fa-solid fa-gear"></i>
                    </div>
                </div>
                <div class="d-flex align-items-center" id="chainBtn" onclick="${chainClick}">
                    <div id="chainLogo" style="background-image: url('${"https://raw.githubusercontent.com/virgoproject/tokens/main/" + selectedWallet.chainID + "/logo.png"}')"></div>
                    <p id="chainText" class="m-0">${selectedWallet.name}<i class="fa-solid fa-caret-up" id="chainNameIcon"></i></p>
                </div>
                <div id="historyBtn" onclick="${historyClick}">
                    <i class="fa-regular fa-clock-rotate-left"></i>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #header {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 8px;
                overflow: hidden;
            }
        
            #icon {
                border-radius: 50%;
            }
            
            #paramsIcon {
                line-height: 22px;
                background: var(--gray-100);
                height: 26px;
                width: 26px;
                text-align: center;
                border-radius: 50%;
                color: var(--gray-400);
                position: relative;
                left: 20px;
                top: -16px;
                border: 2px solid white;
            }
            
            #chainLogo {
                height: 24px;
                width: 24px;
                border: none;
                border-radius: 50%;
                background-color: var(--gray-100);
                margin-right: 0.75em;
                background-size: cover;
            }
            
            #accountBtn {
                height: 32px;
                cursor: pointer;
            }
            
            #chainBtn {
                cursor: pointer;
            }
            
            #chainNameIcon {
                vertical-align: text-bottom;
                margin-left: 0.75em;
                color: var(--gray-400);
                transition: all 0.25s ease-in 0s;
            }
            
            #chainNameIcon.opened {
                transform: rotate(180deg);
                padding-top: 2px;
            }
            
            #chainText {
                color: var(--gray-700);
            }
            
            #historyBtn {
                background: var(--gray-100);
                height: 32px;
                width: 32px;
                text-align: center;
                line-height: 32px;
                border-radius: 50%;
                color: var(--gray-400);
                cursor: pointer;
            }
            
        `;
    }

}

Stateful.define("home-header", HomeHeader)