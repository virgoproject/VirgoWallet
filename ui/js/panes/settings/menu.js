class SettingsMenu extends StatefulElement {

    constructor() {
        super();
    }

    render(){

        return `
            <div id="wrapper">
                
            </div>
        `

    }

    style() {
        return `
            #wrapper {
                height: 100%;
                width: 100%;
                top: 0px;
                position: absolute;
                background: white;
                z-index: 1000;
            }
        `
    }

}

Stateful.define("settings-menu", SettingsMenu);
