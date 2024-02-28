class SectionHeader extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this
        if(!this.hasAttribute("backfunc")) return
        this.querySelector("#back").onclick = () => {
            _this.backfunc()
        }

        if(this.hasAttribute("logo")){
            const logo = this.querySelector("#logo")

            logo.onload = e => {
                e.target.style.display = "initial"
                _this.querySelector("#shimmerIcon").style.display = "none"
            }
            logo.src = this.getAttribute("logo")
        }

    }

    render() {

        return `
            <div class="row px-3 py-1 d-flex align-items-baseline mt-1">
                <div class="col-1">
                    ${this.hasAttribute("backfunc") ? '<i class=" fas fa-chevron-left" id="back"></i>' : ''}
                </div>
                ${this.getTitle()}
                <div class="col-1"></div>
            </div>
        `;
    }

    getTitle() {
        if(this.hasAttribute("logo")){
            return `
                <div class="col-10 text-xl p-0 text-center">
                    <div class="shimmerBG" id="shimmerIcon"></div>
                    <img style="display: none" id="logo">
                    <p class="d-inline pl-2" id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }else{
            return `
                <div class="col-10 text-xl p-0 text-center">
                    <p id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }
    }

    style() {
        return `
        
            #title {
                color: var(--gray-700);
                vertical-align: middle;
                margin: 0;
            }
            
            #back {
                cursor: pointer;
                transition: all ease-in 0.2s;
                font-size: 1.25em;
                color: var(--gray-400);
                vertical-align: text-bottom;
            }
            
            #back:hover {
                color: var(--gray-700);
            }
            
            #shimmerIcon {
                height: 32px;
                width: 32px;
                border-radius: 100%;
                animation-duration: 35s;
                display: inline-block;
                vertical-align: middle;
            }
            
            #logo {
                height: 32px;
                width: 32px;
                border-radius: 100%;
            }
        `;
    }

}

Stateful.define("section-header", SectionHeader)
