class HomeMainBalance extends StatefulElement {

    async render() {

        const {data, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()

            const selectedAddress = baseInfos.addresses[baseInfos.selectedAddress]

            let totalBalance = 0;

            for(const contractAddr of Object.keys(selectedAddress.balances)){
                const balance = selectedAddress.balances[contractAddr]

                if(!balance.tracked) continue;

                totalBalance += balance.price*balance.balance/10**balance.decimals
            }


            return {
                totalBalance: totalBalance,
                address: selectedAddress.address,
                name: selectedAddress.name,
                selectedCurrency: baseInfos.selectedCurrency
            }

        }, 5000)

        if(loading) return ""

        const copyAddress = this.registerFunction(() => {
            copyToClipboard(data.address);
            notyf.success("Address copied to clipboard!");
        })

        const qrClick = this.registerFunction(() => {
            QRScannerPane.init()
        })

        return `
            <div class="d-flex mt-3 mb-1 align-items-center">
                <p id="accountName" class="m-0">${data.name}</p>
                <div id="addressBtn" class="d-flex text-sm" onclick="${copyAddress}">
                    <span id="address">${data.address.replace(data.address.substring(4,38),"...")} </span>
                    <i class="fa-solid fa-copy"></i>
                </div>
                ${document.isMobile ? `
                    <div id="qrBtn" onclick="${qrClick}">
                        <i class="fa-light fa-qrcode"></i>
                    </div>
                ` : ""}
            </div>
            <p id="totalBalance" class="text-3xl">${Utils.beautifyAmount(data.totalBalance)} ${currencyToSymbol(data.selectedCurrency)}</p>
        `;
    }

    style() {
        return `
            #accountName {
                color: var(--gray-700);
                font-weight: 600;
            }
        
            #address {
                white-space: pre-wrap;
            }
        
            #addressBtn, #qrBtn {
                margin-left: 1em;
                padding: 0.25em 1em;
                background: var(--gray-50);
                border-radius: 50em;
                color: var(--gray-400);
                font-size: 0.75em;
                align-items: center;
                cursor: pointer;
                transition: all 0.1s ease-in;
            }
            
            #addressBtn:hover, #qrBtn:hover {
                background: var(--gray-100);
            }
            
            #qrBtn {
                font-size: 1em;
                border-radius: 0.5em;
                line-height: 0;
                padding: 0.5em;
            }
            
            #addressBtn i {
                font-size: 0.75em;
            }
            
            #totalBalance {
                font-weight: 600;
                color: var(--gray-700);
            }
        `;
    }

}

Stateful.define("home-main-balance", HomeMainBalance)
