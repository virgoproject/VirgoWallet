class SearchBar extends StatefulElement {

    async render() {

        const _this = this

        const inputHandler = this.registerFunction(e => {
            if(_this.inputhandler){
                _this.inputhandler(e.target.value)
            }
        })

        return `
            <div id="wrapper" class="d-flex">
                <div id="inputWrapper">
                    <input type="text" placeholder="Search for a currency" id="input" oninput="${inputHandler}">
                </div>
                <div id="iconWrapper">
                    <i class="fa-regular fa-magnifying-glass"></i>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                margin: 0.75em 2em;
                border-bottom: 1px solid var(--gray-100);
            }
            
            #inputWrapper {
                flex: 1;
            }
            
            #input {
                border: none;
                width: 100%;
                outline: none;
            }
            
            #iconWrapper {
                padding-left: 1em;
            }
        `;
    }

}

Stateful.define("search-bar", SearchBar)