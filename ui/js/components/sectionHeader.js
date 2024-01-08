class SectionHeader extends StatefulElement {

    constructor() {
        super();
    }

    eventHandlers() {
        const _this = this
        this.querySelector("#back").onclick = () => {
            _this.backfunc()
        }
    }

    render() {

        const title = this.getAttribute("title")

        return `
            <div class="row px-3 py-1 d-flex align-items-baseline">
                <div class="col-1"><i class=" fas fa-chevron-left" id="back"></i></div>
                <div class="col-10 p-0 text-center" id="title">${title}</div>
                <div class="col-1"></div>
            </div>
        `;
    }

    style() {
        return `
            #title {
                font-size: 1.25rem;
            }
            
            #back {
                cursor: pointer;
                transition: all ease-in 0.1s;
                font-size: 1.25em;
            }
            
            #back:hover {
                color: #111;
            }
        `;
    }

}

Stateful.define("section-header", SectionHeader)
