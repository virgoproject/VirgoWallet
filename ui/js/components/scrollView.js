class ScrollView extends StatefulElement {

    eventHandlers() {
        const _this = this

        const elem = this.querySelector("#scroll")

        elem.addEventListener('wheel', (event) => {
            console.log(event)
            if(event.deltaY < 0 && _this.onscrollup) _this.onscrollup()
            if(event.deltaY > 0 && _this.onscrolldown) _this.onscrolldown()
            const scrollPercentage = (elem.scrollTop / (elem.scrollHeight - elem.clientHeight));
            if(scrollPercentage > 0.7 && _this.onnearend) _this.onnearend()
        })

    }

    getScroll(){
        return this.querySelector("#scroll").scrollTop
    }

    setScroll(val){
        this.defaultScroll = val
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

    afterRender() {
        if(this.defaultScroll == undefined) return
        const elem = this.querySelector("#scroll")
        elem.virtualScrollTop = this.defaultScroll
        elem.scrollTop = this.defaultScroll
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
