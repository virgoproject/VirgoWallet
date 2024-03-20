class ConnectedWebsite extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this

        _this.querySelector("#delete").onclick = () => {
            let siteID = _this.data

            if(_this.data.params !== undefined)
                siteID = _this.data.params.topic

            deleteConnectedSite(siteID)

            const [removing, setRemoving] = _this.useState("removing")
            setRemoving(true)
        }
    }

    render(){
        const [removing, setRemoving] = this.useState("removing", false)

        this.data = this.getAttribute("data")

        try {
            this.data = JSON.parse(atob(this.data))
        }catch(e){}

        let name = ""
        let iconSrc = ""

        if(this.data.type == "walletConnect"){
            name = this.data.params.peer.metadata.url.replace(/(^\w+:|^)\/\//, '')

            if(this.data.params.peer.metadata.icons !== undefined)
                iconSrc = this.data.params.peer.metadata.icons[this.data.params.peer.metadata.icons.length-1]
            else
                iconSrc = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url='+ this.data.params.peer.metadata.url +'&size=128'

        }else{
            name = this.data.replace(/(^\w+:|^)\/\//, '')
            iconSrc = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url='+ this.data +'&size=128'
        }

        let icon = `<i class="far fa-unlink" id="delete"></i>`

        if(removing){
            icon = `<i class="far fa-spinner fa-spin"></i>`
        }

        return `
            <div class="row justify-content-center align-items-center p-2 mt-2">
                <img class="col-3 img-fluid" src="${iconSrc}"/>
                <span class="col-7">${name}</span>
                <div class="col-2">
                    ${icon}
                </div>
            </div>
            `
    }

    style() {
        return `
            div {
                background: var(--whiteBackground);
                border-radius: 0.5em;
                padding-top: 0.375em;
                padding-bottom: 0.375em;
                transition: background ease 0.25s;
            }
            
            #delete {
                cursor: pointer;
                transition: all ease-in 0.25s;
            }
            
            #delete:hover {
                cursor: pointer;
                color: var(--bs-danger);
            }
            
            img {
                border-radius: 50%;
            }
            
            span {
                text-overflow: ellipsis;
                overflow: hidden;
                max-width: 25ch;
                white-space: nowrap;
            }
        `
    }

}

Stateful.define("connected-website", ConnectedWebsite);
