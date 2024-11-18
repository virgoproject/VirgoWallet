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

        let chainSelector = document.querySelector("chain-selector")
        const chainClick = this.registerFunction(() => {
            if(chainSelector && chainSelector.deleting) chainSelector = false
            if(!chainSelector){
                chainSelector = document.createElement("chain-selector")
                chainSelector.resetHome = () => {
                    _this.resetassets()
                    _this.runFunctions()
                    chainSelector.removeWithAnimation()
                }
                document.body.appendChild(chainSelector)
                this.querySelector("#chainNameIcon").classList.add("opened")
            }else{
                chainSelector.removeWithAnimation()
                chainSelector = false
                this.querySelector("#chainNameIcon").classList.remove("opened")
            }
        })

        let accountSelector = document.querySelector("account-selector")
        const accountClick = this.registerFunction(() => {
            if(!accountSelector){
                accountSelector = document.createElement("account-selector")
                accountSelector.resetHome = () => {
                    _this.resetassets()
                    _this.runFunctions()
                }
                document.body.appendChild(accountSelector)
                this.querySelector("#accountBtn").classList.add("opened")
                for(const elem of document.querySelectorAll("chain-selector").values()){
                    elem.remove()
                }
            }else{
                accountSelector.removeWithAnimation()
                accountSelector = false
                this.querySelector("#accountBtn").classList.remove("opened")
            }
        })

        return `
            <div id="header">
                <div id="accountBtn" onclick="${accountClick}">
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
                background: var(--gray-50);
                height: 26px;
                width: 26px;
                text-align: center;
                border-radius: 50%;
                color: var(--gray-400);
                position: relative;
                left: 20px;
                top: -16px;
                border: 2px solid white;
                transition: 0.1s all ease-in;
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
                z-index: 10;
            }
            
            #accountBtn:hover #paramsIcon {
                background: var(--gray-100);
            }
            
            #icon {
                transition: all 0.1s ease-in 0s;
            }
            
            #accountBtn.opened #icon {
                transform: rotate(90deg);
            }
            
            #chainBtn {
                cursor: pointer;
            }
            
            #chainNameIcon {
                vertical-align: text-bottom;
                margin-left: 0.75em;
                color: var(--gray-400);
                transition: all 0.1s ease-in 0s;
            }
            
            #chainNameIcon.opened {
                transform: rotate(180deg);
                padding-top: 2px;
            }
            
            #chainText {
                color: var(--gray-700);
            }
            
            #historyBtn {
                background: var(--gray-50);
                height: 32px;
                width: 32px;
                text-align: center;
                line-height: 32px;
                border-radius: 50%;
                color: var(--gray-400);
                cursor: pointer;
                transition: all 0.1s ease-in;
            }
            
            #historyBtn:hover {
                background: var(--gray-100);
            }
            
        `;
    }

}

Stateful.define("home-header", HomeHeader)
