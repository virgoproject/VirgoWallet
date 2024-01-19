class SettingsNetworkRow extends StatefulElement {

    eventHandlers() {
        const _this = this
        const name = this.getAttribute("name")
        const chainID = this.getAttribute("chainID")
        const index = this.getAttribute("index")

        this.querySelector("svg").innerHTML = jdenticon.toSvg(name+chainID, 32)

        this.querySelector("img").onload = e => {
            e.target.style.display = "initial"
            _this.querySelector("svg").style.display = "none"
        }

        this.querySelector("img").src = "https://raw.githubusercontent.com/virgoproject/tokens/main/" + chainID + "/logo.png"

        if(this.getAttribute("current") == "true") return

        const row = _this.querySelector(".row")

        row.onclick = () => {
            if(row.classList.contains("selected")){
                row.classList.remove("selected")
            }else{
                row.classList.add("selected")
            }
            changeNetworkVisibility(index).then(() => {
                selectChains.updateChains()
            })
        }

    }

    render() {

        const name = this.getAttribute("name")
        const ticker = this.getAttribute("ticker")
        const chainID = this.getAttribute("chainID")
        const tracked = this.getAttribute("tracked") == "true"
        const current = this.getAttribute("current") == "true"

        return `
            <div class="row ${tracked ? "selected" : ""} ${current ? "disabled" : ""}">
                <div class="col-2 justify-content-center align-self-center">
                    <img class="logo" src="" style="display: none">
                    <svg data-jdenticon-value="${name+chainID}" width="32" height="32"></svg>
                </div>
                <div class="col-8">
                    <p class="name">${name} ${current ? "(current)" : ""}</p>
                    <p class="ticker">${ticker}</p>
                </div>
                <div class="col-2 text-right justify-content-center align-self-center">
                    <i class="fas fa-check" id="state"></i>
                </div>
            </div>
        `
    }

    style() {
        return `
            .row {
                background: var(--whiteBackground);
                border-radius: 0.5em;
                padding-top: 0.375em;
                padding-bottom: 0.375em;
                cursor: pointer;
            }
            
            .row:hover {
                background: var(--whiteBackgroundHover);
            }
            
            .row.selected {
                background: var(--whiteBackgroundSelected);
            }
            
            .row.disabled {
                cursor: default;
                opacity: 0.5;
            }
            
            #state {
                display: none;
            }
            
            .row.selected #state {
                display: inline-block;
            }
            
            p {
                margin-bottom: 0!important;
            }
            
            .name {
                font-weight: 600;
            }
            
            .ticker {
                font-size: 0.85em;
            }
            
            .logo {
                height: 32px;
                width: 32px;
                border-radius: 50%;
                background-size: cover;
                margin: auto;
            }
            
            svg {
                border-radius: 50%;
            }
            
        `
    }

}

Stateful.define("settings-network-row", SettingsNetworkRow)
