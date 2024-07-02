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
                    <div id="content">
                        <div id="list" class="px-3">
                            <p class="label">Daily rewards</p>
                            <daily-reward></daily-reward>
                            <swap-rewards></swap-rewards>
                        </div>
                    </div>
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
            
            #content {
                height: 100%;
            }
            
            #list {
                height: 100%;
                overflow: auto;
                padding-bottom: 15em;
            }
        `;
    }

}

Stateful.define("quests-pane", QuestsPane)
