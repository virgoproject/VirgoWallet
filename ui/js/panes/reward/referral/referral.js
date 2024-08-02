class ReferralPane extends StatefulElement {

    async render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <div id="wrapper">
                    <section-header title="Referral" backfunc="${back}"></section-header>
                    <div id="content">
                        <div id="list" class="px-3">
                            <div class="d-flex">
                                <div>
                                    <p>Invite your friends</p>
                                    <p>Refer them with your code and both earn bonus XP</p>
                                </div>
                                <div id="rewardAmounts">
                                    <p>100 <span>XP</span><br><span>for you</span><p>
                                    <p>50 <span>XP</span><br><span>for your<br>friend</span><p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
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

Stateful.define("referral-pane", ReferralPane)
