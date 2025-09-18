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
                <section-header title="${Stateful.t("generalSettingsTitle")}" backfunc="${back}"></section-header>
                <select-currency></select-currency>
                <select-language></select-language>
           </div>
        `

    }

}

Stateful.define("general-settings", GeneralSettings)
