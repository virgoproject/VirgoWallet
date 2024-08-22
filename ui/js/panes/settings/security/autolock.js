class AutolockSettings extends StatefulElement {

    static options = [
        {
            value: "5",
            text: "5 " + Stateful.t("autolockMinutes")
        },
        {
            value: "10",
            text: "10 " + Stateful.t("autolockMinutes")
        },
        {
            value: "30",
            text: "30 " + Stateful.t("autolockMinutes")
        },
        {
            value: "60",
            text: "1 " + Stateful.t("autolockHour")
        },
        {
            value: "120",
            text: "2 " + Stateful.t("autolockHours")
        },
        {
            value: "360",
            text: "6 " + Stateful.t("autolockHours")
        },
        {
            value: "720",
            text: "12 " + Stateful.t("autolockHours")
        },
        {
            value: "1440",
            text: "1 " + Stateful.t("autolockDay")
        },
    ]

    render() {
        const _this = this

        const onChange = this.registerFunction(() => {
            setAutolock(_this.querySelector("#enabled").checked, parseInt(_this.querySelector("#delay").value))
        })

        const {data, loading} = this.useInterval(async () => {
            const res = await getAutolock()

            return res
        }, 1000)

        let selected = "60"
        let checked = false

        if(!loading){
            selected = data.delay
            checked = data.enabled
        }

        const rows = []

        for(const option of AutolockSettings.options){
            rows.push(`
                <option value="${option.value}" ${selected == option.value ? "selected" : ""}>${option.text}</option>
            `)
        }

        return `
            <select class="form-select" id="delay" onchange="${onChange}">
                ${rows}
            </select>
            <div class="form-check form-switch mt-2">
                <input class="form-check-input" type="checkbox" id="enabled" ${checked? "checked" : ""} onchange="${onChange}">
                <label class="form-check-label" for="enabled">${Stateful.t("autolockEnableLabel")}</label>
            </div>
        `;
    }

}

Stateful.define("autolock-settings", AutolockSettings)
