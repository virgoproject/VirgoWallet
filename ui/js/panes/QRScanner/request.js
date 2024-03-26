class QRScannerRequest extends StatefulElement {

    eventHandlers() {
        const _this = this

        let src = ""

        if(this.req.params.proposer.metadata.icons !== undefined)
            src = this.req.params.proposer.metadata.icons[this.req.params.proposer.metadata.icons.length-1]
        else
            src = `https://www.google.com/s2/favicons?domain=${this.req.params.proposer.metadata.url}&sz=64`

        const logo = this.querySelector("#logo")

        logo.onload = e => {
            logo.style.display = "initial"
            _this.querySelector("#logoShimmer").style.display = "none"
        }

        logo.src = src
    }

    render() {
        const _this = this

        const back = this.registerFunction(() => {
            walletConnect.refuse(_this.req)
            _this.resetCooldown()
            _this.remove()
        })

        const accept = this.registerFunction(() => {
            walletConnect.allow(_this.req)
            notyf.success("Successfully connected!")
            _this.removeParent()
            _this.remove()
        })

        return `
            <bottom-popup onclose="${back}">
                <section-header title="Connection request" no-padding></section-header>
                <div id="content">
                    <div id="logoShimmer" class="shimmerBG"></div>
                    <img id="logo" style="display: none">
                    <p class="mt-2" id="title">Connect your wallet to<br>
                        <span id="sitename">${this.req.params.proposer.metadata.url.replaceAll("https://", "").replaceAll("http://", "")}?</span>
                    </p>
                </div>
                <div class="mt-3">
                    <button class="button w-100" onclick="${accept}">Accept</button>
                </div>
            </bottom-popup>
        `
    }

    style() {
        return `
            #content {
                flex-grow: 1;
                min-height: 0;
                text-align: center;
            }
            
            #title {
                color: var(--gray-700);
            }
            
            #sitename {
                color: var(--main-700);
            }
        
            #logo, #logoShimmer {
                height: 52px;
                width: 52px;
                background-size: cover;
                border-radius: 50%;
                animation-duration: 35s;
                margin: auto;
                margin-top: 1em;
            }
            
        `;
    }

}

Stateful.define("qr-scanner-request", QRScannerRequest)
