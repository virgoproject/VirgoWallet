class ConnectedWebsites extends StatefulElement {

    constructor() {
        super();
    }

    render(){
        const {data: connectedWebsites, loading} = this.useInterval(async () => {
            const baseInfos = await getBaseInfos()
            return baseInfos.connectedSites
        }, 1000)

        if(loading) {
            return
        }

        if(connectedWebsites.length <= 0 || connectedWebsites.length === undefined){
            return this.noConnectedWebsites()
        }

        const rows = []

        for(const connectedWebsite of connectedWebsites){
            rows.push(`<connected-website data="${connectedWebsite}"></connected-website>`)
        }

        return `<list>${rows}</list>`

    }

    noConnectedWebsites(){
        return `
        <NoConnectedWebsites class="text-center">
            <img src="../images/noSites.png" alt="noSites" class="img-fluid" />
            <p class="m-0">No connected websites</p>
            <p class="p-0 m-0">Web3 connections will appear here</p>
        </NoConnectedWebsites>
        `
    }

}

Stateful.define("connected-websites", ConnectedWebsites);