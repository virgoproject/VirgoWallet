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
    }

    render() {

        const title = this.getAttribute("title")

        return `
            <div class="row px-3 py-1 d-flex align-items-baseline mt-1">
                <div class="col-1">
                    ${this.hasAttribute("backfunc") ? '<i class=" fas fa-chevron-left" id="back"></i>' : ''}
                </div>
                <div class="col-10 p-0 text-center text-xl" id="title">${title}</div>
                <div class="col-1"></div>
            </div>
        `;
    }

    style() {
        return `
        
            #title {
                color: var(--gray-700);
            }
            
            #back {
                cursor: pointer;
                transition: all ease-in 0.2s;
                font-size: 1.25em;
                color: var(--gray-400);
            }
            
            #back:hover {
                color: var(--gray-700);
            }
        `;
    }

}

Stateful.define("section-header", SectionHeader)
