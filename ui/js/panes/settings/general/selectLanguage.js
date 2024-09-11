class SelectLanguage extends StatefulElement {

    constructor() {
        super();
    }

    languages = {
        "en": "English",
        "fr": "Français",
        "es": "Español",
        "ar": "العربية",
        "zh": "中文",
        "de": "Deutsch",
        "id": "Bahasa Indonesia",
        "it": "Italiano",
        "ja": "日本語",
        "ko": "한국어",
        "pt": "Português",
        "ru": "Русский",
        "tr": "Türkçe",
        "uk": "Українська",
        "vi": "Tiếng Việt",
    }

    eventHandlers() {
        this.querySelector("#select").addEventListener("change", (event) => {
            setLanguage(event.target.value)
            Stateful.setLocale(event.target.value)
            $("#footerHomeText").html(Stateful.t("footerHomeText"))
            $("#footerPayText").html(Stateful.t("footerPayText"))
            $("#footerSwapText").html(Stateful.t("footerSwapText"))
            $("#footerRewardsText").html(Stateful.t("footerRewardsText"))
        });
    }

    render() {

        const [selected, setSelected] = this.useState("selected", false)

        if(!selected){
            getBaseInfos().then(res => {
                if(res.selectedLanguage == "") res.selectedLanguage = "en"
                setSelected(res.selectedLanguage)
            })
            return ""
        }

        const rows = []

        for(const language in this.languages){
            rows.push(`<option value="${language}" ${selected == language ? "selected" : ""}>${this.languages[language]}</option>`)
        }

        return `
            <div class="row currencyConversion">
                <h5 class="currencyConversionTitle">${Stateful.t("langSettingTitle")}</h5>
                <p class="currencyConversionDesc">${Stateful.t("langSettingSub")}</p>
                <select id="select">
                    ${rows}
                </select>
            </div>
        `

    }

    style() {
        return `
            div {
                padding: 1em 2em;
            }
            
            h5 {
                font-size: 1em;
                font-weight: bold;
            }
            
            p {
                font-size: .85em;
            }
            
            select {
                padding: 0.575em;
                background-color: #e9e9e9;
                border: none;
                appearance: none;
                background-repeat: no-repeat;
                background-image: url(data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E);
                background-size: 0.65rem auto;
                background-position: right 1rem top 50%;
                border-radius: 5px;
            }
        `;
    }

}

Stateful.define("select-language", SelectLanguage)
