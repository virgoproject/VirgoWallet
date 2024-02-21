class SearchBar extends StatefulElement {

    async render() {

        const _this = this

        const inputHandler = this.registerFunction(e => {
            if(_this.inputhandler){
                _this.inputhandler(e.target.value)
            }
        })

        return `
            <div id="wrapper">
                <div id="bar" class="d-flex">
                    <div id="iconWrapper">
                        <i class="fa-regular fa-magnifying-glass"></i>
                    </div>
                    <div id="inputWrapper">
                        <input type="text" placeholder="Search for a currency" class="text-sm" id="input" oninput="${inputHandler}">
                    </div>
                </div>
            </div>
        `;
    }

    hide(){
        this.querySelector("#wrapper").classList.add("closed")
    }

    show(){
        this.querySelector("#wrapper").classList.remove("closed")
    }

    style() {
        return `
            #wrapper {
                background: white;
                height: 56px;
                overflow: hidden;
                transition: height ease-in 0.2s;
            }
            
            #wrapper.closed {
                height: 0px;
            }
        
            #bar {
                background-color: var(--gray-100);
                padding: 0.5em 1em;
                border-radius: 0.5em;
                margin: 0.75em 2em;
            }
            
            #inputWrapper {
                flex: 1;
            }
            
            #input {
                border: none;
                width: 100%;
                outline: none;
                background: transparent;
                color: var(--gray-700);
                font-weight: 500;
                vertical-align: text-bottom;
            }
            
            #input::placeholder {
                color: var(--gray-400);
            }
            
            #iconWrapper {
                padding-right: 1em;
                color: var(--gray-400);
            }
        `;
    }

}

Stateful.define("search-bar", SearchBar)