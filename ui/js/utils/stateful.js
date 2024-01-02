class Stateful {

    static elementsLocations = {}
    static globalStylesheets = []

    static addGlobalStylesheet(href){
        const scriptUrl = new URL(document.currentScript.src);

        // Resolve the relative path based on the calling script's location
        const resolvedHref = new URL(href, scriptUrl).href;

        if(this.globalStylesheets.includes(resolvedHref)) return;

        this.globalStylesheets.push(resolvedHref);
    }

    static define(tag, elem){
        this.elementsLocations[tag.toUpperCase()] = document.currentScript.src;
        customElements.define(tag, elem);
    }

}

class StatefulElement extends HTMLElement {

    constructor() {
        super();

        this.states = {};

        //create shadow root
        this.shadow = this.attachShadow({ mode: 'open' });

        //append custom HTML
        this.content = document.createElement("elem-content");
        this.shadow.appendChild(this.content);

        //append custom style
        const style = document.createElement("style");
        style.textContent = this.style();
        this.shadow.appendChild(style);

        //apply global stylesheets
        for(const href of Stateful.globalStylesheets){
            this.useStylesheet(href);
        }

        this._renderContent();

    }

    _renderContent(){
        this.content.innerHTML = this.sanitizeHTML(this.render());
        requestAnimationFrame(() => {
            this.eventHandlers();
        });
    }

    eventHandlers(){

    }

    render(){
        return "";
    }

    style(){
        return "";
    }

    useStylesheet(href) {
        const scriptUrl = new URL(Stateful.elementsLocations[this.tagName]);

        // Resolve the relative path based on the script's location
        const resolvedHref = new URL(href, scriptUrl).href;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = resolvedHref;

        this.shadow.appendChild(link);
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

        if (!Number.isInteger(interval) || interval <= 0) {
            throw new Error('Invalid parameter: interval must be a positive integer.');
        }

        const funcHash = this.hashFunction(func);

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

        // Use setInterval to fetch data at regular intervals
        const intervalId = setInterval(fetchData, interval);

        // Cleanup interval when the element is disconnected from the DOM
        this.addEventListener('disconnectedCallback', () => clearInterval(intervalId));

        // Initial data fetch
        fetchData();

        return {data, loading: true};
    }

    querySelector(selectors) {
        return this.shadow.querySelector(selectors);
    }

    //returns a hash for a given function, collisions are possible but shouldn't be a concern for our use-case
    hashFunction(func){
        const str = func.toString();

        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }

        return ""+hash;
    }

    //doesn't prevent code execution and XSS, only remove parasite chars echoed when returning list of HTML nodes
    sanitizeHTML(rawHtml) {
        const bodyElement = document.createElement("toSanitize");
        bodyElement.innerHTML = rawHtml;

        const toCheck = [];

        toCheck.push(bodyElement);

        while(toCheck.length != 0){
            const e = toCheck.pop();

            if(e.nodeName == "#text" && e.textContent == "," && e.previousSibling != null && e.nextSibling != null){
                e.remove();
            }

            for(let i = 0; i < e.childNodes.length; i++){
                toCheck.push(e.childNodes[i]);
            }
        }

        return bodyElement.innerHTML;
    }

}