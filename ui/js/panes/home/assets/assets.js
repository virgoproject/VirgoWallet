class HomeAssets extends StatefulElement {

    async render() {
        const [menu, setMenu] = this.useState("menu", "tokens")

        const menuClick = this.registerFunction(e => {
            if(e.target.classList.contains("selected")) return

            if(e.target.id == "tokensBtn")
                setMenu("tokens")
            else
                setMenu("nfts")

        })

        let manageBtn
        let content
        if(menu == "tokens"){
            const manageClick = this.registerFunction(() => {
                const elem = document.createElement("tokens-list")
                document.body.appendChild(elem)
            })

            manageBtn = `<p class="m-0" id="manageBtn" onclick="${manageClick}">Manage Tokens</p>`
            content = `<home-tokens></home-tokens>`
        }else{
            manageBtn = `<p class="m-0" id="manageBtn">Manage NFTs</p>`
            content = `<home-nfts></home-nfts>`
        }

        return `
            <div class="d-flex mt-3 justify-content-between">
                <div class="d-flex">
                    <div class="menuElem ${menu == 'tokens' ? 'selected' : ''} mr-2" id="tokensBtn" onclick="${menuClick}">
                        Tokens
                    </div>
                    <div class="menuElem ${menu == 'nfts' ? 'selected' : ''} ml-2" id="nftsBtn" onclick="${menuClick}">
                        NFTs
                    </div>
                </div>
                ${manageBtn}
            </div>
            ${content}
        `;
    }

    style() {
        return `
            .menuElem {
                color: var(--gray-400);
                cursor: pointer;
                padding: 0 0.5em;
            }
            
            .menuElem p {
                margin: 0;
            }
            
            .menuElem.selected {
                color: var(--gray-700);
                border-bottom: 3px solid var(--mainColor);
                cursor: default;
                font-weight: 600;
            }
            
            #manageBtn {
                cursor: pointer;
                color: var(--mainColor);
            }
        `;
    }

}

Stateful.define("home-assets", HomeAssets)