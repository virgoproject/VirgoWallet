class ConnectedWebsites extends StatefulElement {

    constructor() {
        super();
    }

    render(){
        const _this = this

        const {data: connectedWebsites, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()

            return baseInfos.connectedSites
        }, 1000)

        if(loading) {
            return
        }

        let content;

        if(connectedWebsites.length <= 0 || connectedWebsites.length === undefined){
            content = `
                <NoConnectedWebsites class="text-center">
                    <img src="../images/noSites.png" alt="noSites" class="img-fluid" />
                    <p id="emptyTitle" class="text-lg mt-3 mb-1">No connected websites</p>
                    <p id="emptySubtitle">Web3 connections will appear here</p>
                </NoConnectedWebsites>
            `
        }else{
            const rows = []

            for(const connectedWebsite of connectedWebsites){
                rows.push(`<connected-website data="${btoa(JSON.stringify(connectedWebsite))}"></connected-website>`)
            }

            content = rows
        }

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Connected websites" backfunc="${back}"></section-header>
                    <scroll-view id="scroll">
                        <div id="inner" class="mx-3 px-3 mb-2">
                            ${content}
                        </div>
                    </scroll-view>
                </div>
            </div>
        `
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
        
            #scroll {
                flex-grow: 1;
                min-height: 0;
            }
            
            #emptyTitle {
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #emptySubtitle {
                color: var(--gray-400);
            }
        `
    }

}

Stateful.define("connected-websites", ConnectedWebsites);
