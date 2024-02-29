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

        const [period, setPeriod] = this.useState("period", "1")

        const [menu, setMenu] = this.useState("menu", "overview")

        const menuClick = this.registerFunction(e => {
            if(e.target.classList.contains("selected")) return

            if(e.target.id == "overviewBtn")
                setMenu("overview")
            else
                setMenu("news")

        })

        const chartClick = this.registerFunction(e => {
            if(e.target.classList.contains("selected")) return

            setPeriod(e.target.getAttribute("period"))
        })

        let content;
        if(menu == "overview"){
            content = `
                    <token-chart cgid="${this.getAttribute('cgid')}" address="${this.getAttribute('address')}" period="${period}"></token-chart>
                    <div id="chartMenu" class="mx-3 px-2 py-1 mt-3">
                        <div class="px-1 ${period == '1' ? 'selected' : ''}" onclick="${chartClick}" period="1">24h</div>
                        <div class="px-1 ${period == '7' ? 'selected' : ''}" onclick="${chartClick}" period="7">7d</div>
                        <div class="px-1 ${period == '30' ? 'selected' : ''}" onclick="${chartClick}" period="30">30d</div>
                        <div class="px-1 ${period == '90' ? 'selected' : ''}" onclick="${chartClick}" period="90">90d</div>
                        <div class="px-1 ${period == '365' ? 'selected' : ''}" onclick="${chartClick}" period="365">1y</div>
                        <div class="px-1 ${period == 'max' ? 'selected' : ''}" onclick="${chartClick}" period="max">All</div>
                    </div>
                    <token-statistics cgid="${this.getAttribute('cgid')}" address="${this.getAttribute('address')}"></token-statistics>
            `
        }else{
            content = `<token-news></token-news>`
        }

        return `
            <div id="wrapper">
                <section-header title="${data.name}" backfunc="${backClick}" logo="${"https://raw.githubusercontent.com/virgoproject/tokens/main/" + MAIN_ASSET.chainID + "/" + data.contract + "/logo.png"}"></section-header>
                <div class="d-flex px-3 mt-3">
                    <div class="menuElem ${menu == 'overview' ? 'selected' : ''} mr-2" id="overviewBtn" onclick="${menuClick}">
                        Overview
                    </div>
                    <div class="menuElem ${menu == 'news' ? 'selected' : ''} ml-2" id="newsBtn" onclick="${menuClick}">
                        News
                    </div>
                </div>
                <scroll-view id="scroll" class="d-block mt-3">
                    ${content}
                </scroll-view>
            </div>
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
            
            #chartMenu {
                display: flex;
                flex-wrap: nowrap;
                justify-content: space-evenly;
                background: var(--gray-100);
                flex-direction: row;
                border-radius: 0.5em;
            }
            
            #chartMenu div {
                cursor: pointer;
                color: var(--gray-400);
            }
            
            #chartMenu div.selected {
                color: var(--mainColor);
                cursor: default;
            }
            
            #scroll {
                flex-grow: 1;
                min-height: 0;
            }
            
            #wrapper {
                display: flex;
                height: 100%;
                flex-direction: column;
            }
        `
    }

}

Stateful.define("token-details-full", TokenDetailsFull)
