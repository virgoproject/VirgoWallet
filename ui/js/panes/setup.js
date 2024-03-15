class WalletSetup extends StatefulElement {

    render() {
        return `
            <div class="fullpageSection" id="wrapper">
                <div class="text-center">
                    <img src="../images/logoGradient.png" id="logo">
                    <p id="title" class="mt-3 text-xl">Welcome</p>  
                    <p id="subtitle">The crypto wallet that rewards its users</p>  
                </div>
                <div>
                    <div class="setupBtn">
                        <div class="btnIcon">
                            <i class="fa-regular fa-plus"></i>
                        </div>
                        <div class="btnText ml-2">
                            <p class="btnTitle">I don't have a wallet</p>
                            <p class="btnSubtitle text-sm">Setup a new seed phrase and password</p>
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
            
            .btnSubtitle {
                color: var(--gray-400);
            }
        `
    }
}

Stateful.define("wallet-setup", WalletSetup)