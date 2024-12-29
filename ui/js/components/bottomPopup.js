class BottomPopup extends StatefulElement {

    render() {
        const _this = this

        const back = this.registerFunction(() => {
            if(_this.onclose) _this.onclose()
            if(!_this.hasAttribute("prevent-remove")){
                _this.remove()
            }
        })

        const preventPropagation = this.registerFunction(e => {
            e.stopPropagation()
        })

        return `
            <div id="wrapper" onclick="${back}">
                <div id="content" onclick="${preventPropagation}">
                    <i class="fa-solid fa-horizontal-rule" id="rule" onclick="${back}"></i>
                    <slot></slot>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                z-index: 1000000;
                position: absolute;
                inset: 0px;
                background: #000000d6;
                cursor: pointer;
            }
            
            #content {
                border-radius: 30px 30px 0px 0px;
                background: white;
                position: absolute;
                z-index: 15;
                left: 0;
                width: 100%;
                bottom: 0;
                padding: 1em;
                cursor: default;
                max-height: 80%;
                display: flex;
                flex-direction: column;
            }
            
            #rule {
                position: absolute;
                color: gray;
                font-size: 35px;
                margin-top: -1.5em;
                left: 50%;
                transform: translateX(-50%);
                cursor: pointer;
            }
        `;
    }

}

Stateful.define("bottom-popup", BottomPopup)
