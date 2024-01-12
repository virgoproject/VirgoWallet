class SecuritySettings extends StatefulElement {

    constructor() {
        super();
    }

    render() {
        const _this = this

        const [show, setShow] = this.useState("show", false)

        if(!show){
            askPassword().then(res => {
                if(res){
                    setShow(true)
                    return
                }

                _this.remove()
            })
            return
        }

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onClick = this.registerFunction(e => {
            const elem = document.createElement(e.target.getAttribute("data-open"))
            document.body.appendChild(elem)
        })

        return `
            <div class="fullpageSection">
                <section-header title="Security & Privacy" backfunc="${back}"></section-header>
                <div id="content">
                    <div class="row group">
                        <h5 class="title">Backup seed phrase</h5>
                        <p class="desc">Reveal your current seed phrase to backup your wallet.</p>
                        <button class="button tab" data-open="settings-backup-seed" onclick="${onClick}">Reveal Seed Phrase</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">Protect Your Wallet</h5>
                        <p class="desc">Setup a password that will be asked to unlock the wallet after inactivity.</p>
                        <button class="buttonEmpty tab" data-open="settings-new-password" onclick="${onClick}">Setup/Change password</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">Restore account</h5>
                        <p class="desc">Import an already existing seed phrase into the wallet.</p>
                        <button class="buttonEmpty tab" data-target="importMnemonic">Import seed phrase</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">Auto-Lock</h5>
                        <p class="desc">Choose the amount of time before the wallet automatically locks.</p>
                        <autolock-settings></autolock-settings>
                    </div>
                </div>
            </div>
        `;
    }

    style() {
        return `
        #content {
            padding: 0em 1em;
            overflow: auto;
            height: 100%;
            padding-bottom: 5em;
        }
        
        .group {
            padding: 1em;
        }
        
        .title {
            font-size: 1em;
            font-weight: bold;
        }
        
        .desc {
            font-size: .85em;
        }
        `;
    }

}

Stateful.define("security-settings", SecuritySettings)
