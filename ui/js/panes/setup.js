class WalletSetup extends StatefulElement {

    render() {

        const createClick = this.registerFunction(() => {
            const e = document.createElement("settings-new-password")
            document.body.appendChild(e)
        })

        const recoverClick = this.registerFunction(() => {
            const e = document.createElement("settings-new-password")
            e.import = true
            e.bypassWarning = true
            document.body.appendChild(e)
        })

        return `
            <div class="fullpageSection" id="wrapper">
                <div class="text-center">
                    <img src="../images/logoGradient.png" id="logo">
                    <p id="title" class="mt-3 text-xl">Welcome</p>  
                    <p id="subtitle">The crypto wallet that rewards its users</p>  
                </div>
                <div class="px-3">
                    <div class="setupBtn">
                        <div class="btnIcon">
                            <i class="fa-regular fa-plus"></i>
                        </div>
                        <div class="btnText ml-2" onclick="${createClick}">
                            <p class="btnTitle">I don't have a wallet</p>
                            <p class="btnSubtitle text-sm">Create a new account, seed phrase, and password</p>
                        </div>
                    </div>
                    <div class="setupBtn mt-3">
                        <div class="btnIcon">
                            <i class="fa-regular fa-arrow-down"></i>
                        </div>
                        <div class="btnText ml-2" onclick="${recoverClick}">
                            <p class="btnTitle">I already have a wallet</p>
                            <p class="btnSubtitle text-sm">Import your seed phrase from Metamask, Trust..</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    style(){
        return `
            #title {
                font-weight: 600;
                color: var(--gray-700);
            }
        
            #wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-around;
                padding-top: 10vh;
            }
        
            #logo {
                width: 33%;
            }
            
            #subtitle {
                color: var(--gray-400);
            }
            
            .setupBtn {
                display: flex;
                background: var(--gray-50);
                padding: 1em;
                border-radius: 0.5em;
                cursor: pointer;
                transition: all 0.1s ease-in;
                align-items: center;
            }
            
            .setupBtn:hover {
                background: var(--gray-100);
            }
            
            .setupBtn p {
                margin-bottom: 0;
            }
            
            .btnIcon {
                height: 36px;
                width: 36px;
                text-align: center;
                line-height: 36px;
                background-color: var(--main-50);
                border-radius: 100%;
                color: var(--main-700);
            }
            
            .btnText {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            }
            
            .btnTitle {
                color: var(--gray-700);
            }
            
            .btnSubtitle {
                color: var(--gray-400);
            }
        `
    }
}

Stateful.define("wallet-setup", WalletSetup)
