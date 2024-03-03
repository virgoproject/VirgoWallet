class SectionHeader extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this
        if(this.hasAttribute("backfunc")){
            this.querySelector("#back").onclick = () => {
                _this.backfunc()
            }
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
            <div class="align-items-baseline p-3" id="wrapper">
                <div class="borderDiv">
                    ${this.hasAttribute("backfunc") ? '<i class=" fas fa-chevron-left" id="back"></i>' : ''}
                </div>
                ${this.getTitle()}
                <div class="borderDiv text-right">
                    ${this.getRightIcon()}
                </div>
            </div>
        `;
    }

    getTitle() {
        if(this.hasAttribute("logo")){
            return `
                <div class="text-xl p-0 text-center">
                    <div class="shimmerBG" id="shimmerIcon"></div>
                    <img style="display: none" id="logo">
                    <p class="d-inline pl-2" id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }else{
            return `
                <div class="text-xl p-0 text-center">
                    <p id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }
    }

    getRightIcon(){
        if(!this.hasAttribute("righticon") || !this.hasAttribute("rightclick")) return ""

        return `
            <i class="${this.getAttribute("righticon")}" id="rightIcon" onclick="${this.getAttribute("rightclick")}"></i>
        `
    }

    style() {
        return `
        
            #wrapper {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
            }
            
            .borderDiv {
                min-width: 50px;
            }
        
            #title {
                color: var(--gray-700);
                vertical-align: middle;
                margin: 0;
            }
            
            #back, #rightIcon {
                cursor: pointer;
                transition: all ease-in 0.2s;
                font-size: 1.25em;
                color: var(--gray-400);
                vertical-align: text-top;
            }
            
            #back:hover, #rightIcon:hover {
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
