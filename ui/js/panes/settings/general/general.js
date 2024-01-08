class GeneralSettings extends StatefulElement {

    constructor() {
        super();
    }

    render() {
        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
           <div class="fullpageSection">
                <section-header title="General Settings" backfunc="${back}"></section-header>
                <select-currency></select-currency>
           </div>
        `

    }

}

Stateful.define("general-settings", GeneralSettings)
