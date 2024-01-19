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
                    <p class="m-0">No connected websites</p>
                    <p class="p-0 m-0">Web3 connections will appear here</p>
                </NoConnectedWebsites>
            `
        }else{
            const rows = []

            for(const connectedWebsite of connectedWebsites){
                rows.push(`<connected-website data="${connectedWebsite}"></connected-website>`)
            }

            content = `<list>${rows}</list>`
        }

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <section-header title="Connected websites" backfunc="${back}"></section-header>
                <div id="content">
                    ${content}
                </div>
                
            </div>
        `
    }

    style() {
        return `
            #content {
                padding: 0 2em;
            }
        `
    }

}

Stateful.define("connected-websites", ConnectedWebsites);
