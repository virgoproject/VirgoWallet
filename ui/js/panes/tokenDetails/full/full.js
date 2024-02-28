class TokenDetailsFull extends StatefulElement {

    render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            return await getTokenDetailsCross(_this.getAttribute("address"), MAIN_ASSET.chainID)
        })

        const backClick = this.registerFunction(() => {
            _this.onclose()
        })

        if(loading){
            return `
                <section-header title="" backfunc="${backClick}"></section-header>
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `;
        }

        const menuClick = this.registerFunction(e => {
            if(e.target.classList.contains("selected")) return

            console.log(e.target)

            let other;
            if(e.target.id == "overviewBtn")
                other = _this.querySelector("#newsBtn")
            else
                other = _this.querySelector("#overviewBtn")

            other.classList.remove("selected")
            e.target.classList.add("selected")
        })

        return `
            <section-header title="${data.name}" backfunc="${backClick}" logo="${"https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.chainID + "/" + data.contract + "/logo.png"}"></section-header>
            <div class="d-flex px-3 mt-3">
                <div class="menuElem selected" id="overviewBtn" onclick="${menuClick}">
                    Overview
                </div>
                <div class="menuElem" id="newsBtn" onclick="${menuClick}">
                    News
                </div>
            </div>
            <token-chart cgid="${this.getAttribute('cgid')}"></token-chart>
        `;
    }

    style(){
        return `
            #loading {
                height: 100%;
                align-items: center;
                display: flex;
                align-self: center;
                font-size: 1.25em;
            }
            
            .menuElem {
                color: var(--gray-400);
                cursor: pointer;
                margin: 0 0.25em;
                padding: 0 0.5em;
            }
            
            .menuElem p {
                margin: 0;
            }
            
            .menuElem.selected {
                color: var(--gray-700);
                border-bottom: 3px solid var(--mainColor);
                cursor: default;
            }
        `
    }

}

Stateful.define("token-details-full", TokenDetailsFull)
