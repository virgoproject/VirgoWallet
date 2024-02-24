class TokenDetails extends StatefulElement {

    async render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            try {
                const res = await fetch("https://raw.githubusercontent.com/virgoproject/tokens/main/"+MAIN_ASSET.chainID+"/"+_this.address+"/infos.json")
                const tokenInfos = await res.json()
                return {
                    "type": "full",
                    tokenInfos
                }
            }catch (e) {
                return {
                    "type": "simple"
                }
            }
        })

        let content;

        const closeClick = this.registerFunction(() => {
            _this.remove()
        })

        if(loading){
            content = `
                <section-header backfunc="${closeClick}" title=""></section-header>
                <div id="loading">
                    <i class="fas fa-spinner fa-pulse"></i>
                </div>
            `
        }else if(data.type == "full"){
            content = `
                <token-details-full address="${_this.address}" cgid="${data.tokenInfos.CG_ID}" onclose="${closeClick}"></token-details-full>
            `
        }else{
            content = `
                <token-details-simple address="${_this.address}" onclose="${closeClick}"></token-details-simple>
            `
        }

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    ${content}
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
            
            #loading {
                height: 100%;
                align-items: center;
                display: flex;
                align-self: center;
                font-size: 1.25em;
            }
        `;
    }

}

Stateful.define("token-details", TokenDetails)
