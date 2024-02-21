class TokenCard extends StatefulElement {

    eventHandlers() {
        const _this = this

        const logo = this.querySelector("#logo")
        const address = this.getAttribute("address")

        logo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }
        logo.onerror = e => {
            /**const placeholder = _this.querySelector("#logoPlaceholder")
            placeholder.innerHTML = jdenticon.toSvg(address+MAIN_ASSET.chainID, 36)
            placeholder.style.display = "flex"**/
            _this.querySelector("#defaultLogo").style.display = "flex"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }

        logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.chainID + "/" + address + "/logo.png"

    }

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetails(_this.getAttribute("address"))
        })

        if(loading){
            return `
                <div id="shimmer" class="row">
                    <div class="col-2 align-self-center">
                        <div class="shimmerBG" id="shimmerIcon"></div>
                    </div>
                    <div class="col-10 align-self-center">
                        <div class="shimmerBG" id="shimmerTitle"></div>
                        <div class="shimmerBG" id="shimmerSubtitle"></div>               
                    </div>
                </div>
            `
        }

        const trackingClick = this.registerFunction(e => {
            changeAssetTracking(data.contract)
            if(!e.target.checked)
                document.getElementById("bal"+data.contract).remove()
        })

        return `
            <div class="row" id="wrapper">
                <div class="col-2 align-self-center">
                    <div class="shimmerBG" id="shimmerIcon"></div>
                    <img style="display: none" id="logo">
                    <div id="defaultLogo" style="display: none"><p class="m-auto">${data.name.charAt(0).toUpperCase()}</p></div>
                </div>
                <div class="col-10 d-flex" id="header-wrapper">
                    <div id="header-left">
                        <p id="title" class="text-base">${data.name}</p>
                        <p id="subtitle" class="text-sm">${data.ticker}</p>
                    </div>
                    <div id="header-right" class="pl-1">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="checkbox" ${data.tracked ? "checked" : ""} onclick="${trackingClick}">
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    style() {
        return `
            #shimmer {
                height: 57px;
                width: 100%;
            }
            
            #shimmerIcon {
                height: 36px;
                width: 36px;
                border-radius: 100%;
                animation-duration: 35s;
            }
            
            #shimmerTitle {
                border-radius: 0.5em;
                height: 1em;
                width: 12ch;
                margin-bottom: 0.5em;
                animation-duration: 15s;
            }
            
            #shimmerSubtitle {
                border-radius: 0.5em;
                height: 0.875em;
                width: 8ch;
                animation-duration: 20s;
            }
            
            #wrapper {
                padding: 0.75em 0;
                transition: all 0.2s ease-in;
            }
            
            #wrapper p {
                margin: 0;
            }
            
            #header-wrapper {
                white-space: nowrap;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: center;
                align-items: center;
            }
            
            #header-left {
                flex: 1 2 12ch;
                overflow: hidden;
            }
            
            #header-right {
                flex: 1 0 0%;
                text-align: right;
            }
            
            #title {
                color: var(--gray-700);
            }
            
            #subtitle {
                color: var(--gray-400);
                text-overflow: ellipsis;
                overflow: hidden;
            }
            
            #logo {
                height: 36px;
                width: 36px;
                border-radius: 100%;
            }
            
            #logoPlaceholder {
                border-radius: 100%;
            }
            
            #defaultLogo {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                border-radius: 100%;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            #checkbox {
                width: 3em;
                height: 1.5em;
                margin-left: 0;
                cursor: pointer;
            }
        `;
    }

}

Stateful.define("token-card", TokenCard)