class Stateful {

    static elementsLocations = {}
    static globalStylesheets = []
    static stylesMap = {}

    static addGlobalStylesheet(href){
        const scriptUrl = new URL(document.currentScript.src);

        // Resolve the relative path based on the calling script's location
        const resolvedHref = new URL(href, scriptUrl).href;

        if(this.globalStylesheets.includes(resolvedHref)) return;

        this.globalStylesheets.push(resolvedHref);

        for(const styleSheet of document.styleSheets){
            if(styleSheet.href == resolvedHref){
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(Stateful.styleSheetToString(styleSheet));

                Stateful.stylesMap[resolvedHref] = sheet
                return
            }
        }
    }

    static define(tag, elem){
        this.elementsLocations[tag.toUpperCase()] = document.currentScript.src;
        customElements.define(tag, elem);
    }

    static styleSheetToString(sheet){
        let res = ""

        for(const rule of sheet.cssRules){
            res = res + rule.cssText
        }

        return res
    }

    //returns a hash for a given function, collisions are possible but shouldn't be a concern for our use-case
    static hash(func){
        const str = func.toString();

        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }

        return ""+hash;
    }

}

class StatefulElement extends HTMLElement {

    constructor() {
        super();

        this.uid = crypto.randomUUID();

        this.states = {};

        //create shadow root
        this.shadow = this.attachShadow({ mode: 'open' });

        //append custom style
        const style = this.style()
        const styleHash = Stateful.hash(style)

        if(Stateful.stylesMap[styleHash] === undefined){
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(style);
            Stateful.stylesMap[styleHash] = sheet
        }

        this.shadow.adoptedStyleSheets.push(Stateful.stylesMap[styleHash])

        //apply global stylesheets
        for(const href of Stateful.globalStylesheets){
            this.useStylesheet(href);
        }

        //append custom HTML
        this.content = document.createElement("stateful-content");
        this.shadow.appendChild(this.content);

        //this._renderContent();

    }

    connectedCallback(){
        this._renderContent();
    }

    async _renderContent(){
        this.beforeRender()

        const active = this.shadow.activeElement

        this.content.innerHTML = this.sanitizeHTML(await this.render());

        const _this = this

        let after = () => {
            try {
                _this.renderFuncs();
                _this.eventHandlers();

                if(active && active.id){
                    this.shadowRoot.querySelector("#"+active.id).focus()
                }

                _this.afterRender()
            }catch (e){
                setTimeout(() => {
                    after()
                }, 10)
            }
        }

        after()
    }

    eventHandlers(){

    }

    beforeRender(){}

    afterRender(){}

    async render(){
        return "";
    }

    style(){
        return "";
    }

    useStylesheet(href) {
        const scriptUrl = new URL(Stateful.elementsLocations[this.tagName]);

        // Resolve the relative path based on the script's location
        const resolvedHref = new URL(href, scriptUrl).href;

        if(Stateful.stylesMap[resolvedHref] !== undefined){
            this.shadow.adoptedStyleSheets.push(Stateful.stylesMap[resolvedHref])
            return
        }

        for(const styleSheet of document.styleSheets){
            if(styleSheet.href == resolvedHref){
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(Stateful.styleSheetToString(styleSheet));

                Stateful.stylesMap[resolvedHref] = sheet
                this.shadow.adoptedStyleSheets.push(sheet)
                return
            }
        }
    }

    useState(id, initialState) {

        if (typeof id !== 'string' || id.trim() === '') {
            throw new Error('Invalid state ID. Please provide a non-empty string.');
        }

        if(this.states[id] !== undefined){
            return this.states[id];
        }

        const _this = this;

        const setState = newValue => {
            if(newValue == this.states[id][0]) return;

            _this.states[id][0] = newValue;
            _this._renderContent();
        }

        this.states[id] = [initialState, setState];

        return this.states[id];
    }

    useInterval(func, interval) {
        if (typeof func !== 'function') {
            throw new Error('Invalid parameter: fetchFunction must be a function.');
        }

        if (!Number.isInteger(interval)) {
            throw new Error('Invalid parameter: interval must be a positive integer.');
        }

        const funcHash = Stateful.hash(func);

        if(this.states[funcHash] !== undefined){
            return {data: this.states[funcHash][0], loading: false};
        }

        const [data] = this.useState(funcHash, null);

        const fetchData = async () => {
            try {
                const [state, setState] = this.useState(funcHash, null);

                const result = await func();

                if (JSON.stringify(result) !== JSON.stringify(state)) {
                    setState(result);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if(interval > 0){
            // Use setInterval to fetch data at regular intervals
            const intervalId = setInterval(fetchData, interval);

            // Cleanup interval when the element is disconnected from the DOM
            this.addEventListener('disconnectedCallback', () => clearInterval(intervalId));

        }

        // Initial data fetch
        fetchData();

        return {data, loading: true};
    }

    useFunction(func){
        return this.useInterval(func, -1);
    }

    registerFunction(func) {

        const funcHash = Stateful.hash(func);

        if (window.statefulFuncs === undefined){
            window.statefulFuncs = {};
        }

        window.statefulFuncs[this.uid + funcHash] = func;

        return "statefulFunc$"+this.uid + funcHash+"$";
    }


    querySelector(selectors) {
        return this.shadow.querySelector(selectors);
    }

    querySelectorAll(selectors) {
        return this.shadow.querySelectorAll(selectors);
    }

    //doesn't prevent code execution and XSS, only remove parasite chars echoed when returning list of HTML nodes
    sanitizeHTML(rawHtml) {
        const bodyElement = document.createElement("toSanitize");
        bodyElement.innerHTML = rawHtml;

        const toCheck = [];

        toCheck.push(bodyElement);

        while(toCheck.length != 0){
            const e = toCheck.pop();

            for(let i = 0; i < e.childNodes.length; i++){
                toCheck.push(e.childNodes[i]);
            }

            if(e.nodeName == "#text" && e.textContent.trim() == "," && e.previousSibling != null && e.nextSibling != null){
                e.remove();
            }

        }

        return bodyElement.innerHTML;
    }

    renderFuncs(){

        const toCheck = [];

        toCheck.push(this.content);

        while(toCheck.length != 0){
            const e = toCheck.pop();

            for(let i = 0; i < e.childNodes.length; i++){
                toCheck.push(e.childNodes[i]);
            }

            if(e.attributes !== undefined){
                for(let attr in e.attributes){
                    if(e.attributes[attr].nodeName === undefined || e.attributes[attr].nodeValue === undefined){
                        continue;
                    }

                    if(!e.attributes[attr].nodeValue.startsWith("statefulFunc$")){
                        continue;
                    }

                    e[e.attributes[attr].nodeName] = window.statefulFuncs[e.attributes[attr].nodeValue.slice(13, -1)];
                }
            }
        }
    }

}
