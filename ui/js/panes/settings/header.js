class SettingsHeader extends StatefulElement {

    constructor() {
        super();
    }

    render(){
        const title = this.getAttribute("title")
    }

}

Stateful.define("settings-header", SettingsHeader)