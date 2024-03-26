class SettingsNetworkRow extends StatefulElement {

    eventHandlers() {
        const _this = this

        const chainID = this.getAttribute("chainID")

        const logo = this.querySelector("#logo")

        logo.onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }

        logo.onerror = e => {
            _this.querySelector("#defaultLogo").style.display = "flex"
            _this.querySelector("#shimmerIcon").style.display = "none"
        }

        logo.src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chainID + "/logo.png"

    }

    render() {

        const name = this.getAttribute("name")
        const tracked = this.getAttribute("tracked") == "true"
        const index = this.getAttribute("index")
        const current = this.getAttribute("current") == "true"

        const trackingClick = this.registerFunction(() => {
            changeNetworkVisibility(index)
        })

        return `
            <div id="wrapper">
                <div id="leftWrapper">
                    <div class="shimmerBG" id="shimmerIcon"></div>
                    <img style="display: none" id="logo">
                    <div id="defaultLogo" style="display: none"><p class="m-auto">${name.charAt(0).toUpperCase()}</p></div>
                    <p id="name">${name} ${current ? "(current)" : ""}</p>
                </div>
                <div class="form-check form-switch" id="checkWrapper">
                    <input class="form-check-input" type="checkbox" id="checkbox" ${tracked ? "checked" : ""} onclick="${trackingClick}" ${current ? "disabled" : ""}>
                </div>
            </div>
        `
    }

    style() {
        return `
            #wrapper {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.5rem 0;
            }
            
            #leftWrapper {
                display: flex;
                align-items: center;
                min-width: 0;
            }
        
            #logo, #shimmerIcon, #defaultLogo {
                height: 36px;
                width: 36px;
                border-radius: 50%;
                margin-right: 1em;
                animation-duration: 40s;
            }
            
            #defaultLogo {
                text-align: center;
                line-height: 36px;
                background-color: var(--gray-100);
                color: var(--gray-600);
                font-weight: bold;
            }
            
            #name {
                color: var(--gray-700);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        
            p {
                margin-bottom: 0!important;
            }
            
            #checkWrapper {
                padding: 0;
                margin: 0;
                min-height: 0;
            }
            
            #checkbox {
                width: 3em;
                height: 1.5em;
                margin-left: 0;
                cursor: pointer;
                margin-top: 0;
            }
        `
    }

}

Stateful.define("settings-network-row", SettingsNetworkRow)
