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
                    <div>
                        <div>
                            
                        </div>
                        <div>
                                                
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
        `
    }
}

Stateful.define("wallet-setup", WalletSetup)