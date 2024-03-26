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
            <div class="align-items-baseline ${this.hasAttribute("no-padding") ? "" : "p-3"}" id="wrapper">
                ${this.getBack()}
                ${this.getTitle()}
                ${this.getRightIcon()}
            </div>
        `;
    }

    getBack(){
        if(!this.hasAttribute("backfunc")){
            if(this.hasAttribute("righticon") && this.hasAttribute("rightclick"))
                return `<div class="borderDiv"></div>`

            return ""
        }

        return '<div class="borderDiv"><i class=" fas fa-chevron-left" id="back"></i></div>'
    }

    getTitle() {
        if(this.hasAttribute("logo")){
            return `
                <div class="text-xl p-0 text-center" id="titleWrapper">
                    <div class="shimmerBG" id="shimmerIcon"></div>
                    <img style="display: none" id="logo">
                    <p class="d-inline pl-2" id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }else{
            return `
                <div class="text-xl p-0 text-center" id="titleWrapper">
                    <p id="title">${this.getAttribute("title")}</p>
                </div>
            `
        }
    }

    getRightIcon(){
        if(!this.hasAttribute("righticon") || !this.hasAttribute("rightclick")) {
            if(this.hasAttribute("backfunc"))
                return `<div class="borderDiv text-right"></div>`

            return ""
        }

        return `
            <div class="borderDiv text-right">
                <i class="${this.getAttribute("righticon")}" id="rightIcon" onclick="${this.getAttribute("rightclick")}"></i>
            </div>
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
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
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
            
            #titleWrapper {
                flex: 1;
                overflow: hidden;
            }
            
        `;
    }

}

Stateful.define("section-header", SectionHeader)
