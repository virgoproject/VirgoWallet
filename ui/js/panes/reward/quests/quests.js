class QuestsPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Quests" backfunc="${back}"></section-header>
                </div>
            </div>
        `;
    }

    style() {
        return `
            #wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }
        `;
    }

}

Stateful.define("quests-pane", QuestsPane)