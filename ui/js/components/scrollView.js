class ScrollView extends StatefulElement {

    eventHandlers() {
        const _this = this

        const elem = this.querySelector("#scroll")

        elem.virtualScrollTop = elem.scrollTop

        elem.addEventListener('wheel', (event) => {
            // Adjust the scroll position based on the wheel event delta

            elem.virtualScrollTop += event.deltaY

            if(elem.virtualScrollTop < 0)
                elem.virtualScrollTop = 0

            if(elem.virtualScrollTop > elem.scrollHeight - elem.clientHeight)
                elem.virtualScrollTop = elem.scrollHeight - elem.clientHeight

            elem.scroll({
                top: elem.virtualScrollTop,
                left: 0,
                behavior: "smooth",
            })

            const scrollPercentage = (elem.virtualScrollTop / (elem.scrollHeight - elem.clientHeight));

            if(scrollPercentage > 0.7 && _this.onnearend) _this.onnearend()

            // Prevent the default wheel behavior to avoid double scrolling
            event.preventDefault();
        });

    }

    getScroll(){
        return this.querySelector("#scroll").scrollTop
    }

    setScroll(val){
        const elem = this.querySelector("#scroll")
        elem.virtualScrollTop = val
        elem.scrollTop = val
    }

    render() {
        return `
            <div id="scroll">
                <div id="inner">
                    <slot></slot>
                </div>
            </div>
        `
    }

    style() {
        return `
            #scroll {
                overflow: auto;
                max-height: 100%;
            }
        `;
    }

}

Stateful.define("scroll-view", ScrollView)