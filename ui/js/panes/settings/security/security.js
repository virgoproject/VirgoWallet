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
            return ""
        }

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onClick = this.registerFunction(e => {
            const elem = document.createElement(e.target.getAttribute("data-open"))
            document.body.appendChild(elem)
        })

        const importClick = this.registerFunction(() => {
            const e = document.createElement("settings-new-password")
            e.import = true
            document.body.appendChild(e)
        })

        return `
            <div class="fullpageSection">
                <section-header title="${Stateful.t("securitySettingsTitle")}" backfunc="${back}"></section-header>
                <div id="content">
                    <div class="row group">
                        <h5 class="title">${Stateful.t("securitySettingsBackupSeedTitle")}</h5>
                        <p class="desc">${Stateful.t("securitySettingsBackupSeedSub")}</p>
                        <button class="button tab" data-open="settings-backup-seed" onclick="${onClick}">${Stateful.t("securitySettingsBackupSeedBtn")}</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">${Stateful.t("securitySettingsPasswordTitle")}</h5>
                        <p class="desc">${Stateful.t("securitySettingsPasswordSub")}</p>
                        <button class="buttonEmpty tab" data-open="settings-new-password" onclick="${onClick}">${Stateful.t("securitySettingPasswordBtn")}</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">${Stateful.t("securitySettingsImportTitle")}</h5>
                        <p class="desc">${Stateful.t("securitySettingsImportSub")}</p>
                        <button class="buttonEmpty tab" onclick="${importClick}">${Stateful.t("securitySettingsImportBtn")}</button>
                    </div>
                    <div class="row group">
                        <h5 class="title">${Stateful.t("securitySettingsAutolockTitle")}</h5>
                        <p class="desc">${Stateful.t("securitySettingsAutolockSub")}</p>
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
