class SettingsMenu extends StatefulElement {

    constructor() {
        super();
    }

    static categories = [
        {
            title: "General",
            element: "general-settings",
            icon: "fa-gear"
        },
        {
            title: "Security & Privacy",
            element: "security-settings",
            icon: "fa-lock-keyhole"
        },
        {
            title: "Connected Websites",
            element: "connected-websites",
            icon: "fa-sitemap"
        },
        {
            title: "Manage Networks",
            element: "networks-settings",
            icon: "fa-sitemap"
        },
    ]

    eventHandlers() {
        const _this = this

        this.querySelectorAll(".tab").forEach(tab => {
            tab.onclick = () => {
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

        const rows = []

        for(const cat of SettingsMenu.categories){
            rows.push(
                `<div class="row tab" toOpen="${cat.element}">
                    <div class="col-10 d-flex align-items-center">
                        <i class="fa-solid ${cat.icon} me-3 col-2"></i>
                        <h5 class="m-0 col-10">${cat.title}</h5>
                    </div>
                    <div class="col-2 justify-content-center align-self-center text-right">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `)
        }

        return `
           <div class="fullpageSection">
                <section-header title="Settings" backfunc="${back}"></section-header>
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
                font-size: 0.9em;
            }
            
            .tab i {
                font-size: 1.5em;
            }
            
        `
    }

}

Stateful.define("settings-menu", SettingsMenu);
