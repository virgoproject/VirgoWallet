class WalletLoading extends StatefulElement {

    async render() {

        const {data: baseInfos, loading: baseInfosLoading} = this.useFunction(async () => {
            return await getBaseInfos()
        })

        if(baseInfosLoading){
            return `
                <div id="loadingWrapper">
                    <img src="../images/logoGradient.png" id="loadingImage">
                    <i class="fa-solid fa-spinner-third fa-spin text-xl mt-3"></i>
                </div>
            `;
        }

        if(baseInfos.locked){
            const unlock = document.createElement("unlock-wallet")
            document.body.appendChild(unlock)
            this.remove()
            return
        }

        if(!baseInfos.setupDone){
            //display create pane
            return
        }

        const home = document.createElement("wallet-home")
        document.getElementById("resumePane").appendChild(home)
        document.getElementById("mainPane").style.display = "block"
        this.remove()

    }

    style() {
        return `
            #loadingImage {
                width: 33%;
            }
        
            #loadingWrapper {
                display: flex;
                position: absolute;
                top: 0;
                bottom: 0;
                align-items: center;
                left: 0;
                right: 0;
                justify-content: center;
                flex-direction: column;
            }
        `;
    }

}

Stateful.define("wallet-loading", WalletLoading)
