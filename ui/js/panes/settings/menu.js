class SettingsMenu extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this

        this.querySelectorAll(".tab").forEach(tab => {
            tab.onclick = () => {
                if(tab.getAttribute("toOpen") == "contact-settings"){
                    browser.windows.create({
                        url: "https://virgo.net/support"
                    })
                    return
                }

                const elem = document.createElement(tab.getAttribute("toOpen"))
                document.body.appendChild(elem)
            }
        })
    }

    render(){

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const categories  = [
            {
                title: Stateful.t("settingsMenuGeneralTitle"),
                element: "general-settings",
                icon: "fa-gear"
            },
            {
                title: Stateful.t("settingsMenuSecurityTitle"),
                element: "security-settings",
                icon: "fa-lock-keyhole"
            },
            {
                title: Stateful.t("settingsMenuWebsitesTitle"),
                element: "connected-websites",
                icon: "fa-globe"
            },
            {
                title: Stateful.t("settingsMenuNetworksTitle"),
                element: "networks-settings",
                icon: "fa-network-wired"
            },
            {
                title: Stateful.t("settingsMenuContactUsTitle"),
                element: "contact-settings",
                icon: "fa-comments"
            },
        ]

        const rows = []

        for(const cat of categories){
            rows.push(
                `<div class="row tab" toOpen="${cat.element}">
                    <div class="col-2 align-self-center text-center">
                        <i class="fa-regular ${cat.icon}"></i>
                    </div>
                    <div class="col-8 align-self-center p-0 pl-1">
                        <p class="m-0">${cat.title}</p>
                    </div>
                    <div class="col-2 align-self-center text-right">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `)
        }

        return `
           <div class="fullpageSection">
                <section-header title="${Stateful.t("settingsTitle")}" backfunc="${back}"></section-header>
                ${rows}
           </div>
        `

    }

    style() {
        return `            
            .tab {
                padding: 1em 2em;
                cursor: pointer;
            }
            
            .tab:hover {
                background: #00000025;
            }
            
            .tab p {
                font-size: 1.25em;
                font-weight: 500;
            }
            
            .tab i {
                font-size: 1.5em;
                vertical-align: middle;
            }
            
            .tab .fa-chevron-right {
                font-size: 1.25em;
            }
            
        `
    }

}

Stateful.define("settings-menu", SettingsMenu);
