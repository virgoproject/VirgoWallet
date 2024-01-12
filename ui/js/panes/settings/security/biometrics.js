class BiometricsSettings extends StatefulElement {

    render() {
        const _this = this

        let checked = false

        const {data, loading} = this.useInterval(async () => {
            const res = await getBiometrics()

            return res
        }, 1000)

        if(!loading) checked = data

        const onChange = this.registerFunction(() => {
            setBiometrics(_this.querySelector("#enabled").checked)
        })

        return `
            <div class="form-check form-switch mt-2">
                <input class="form-check-input" type="checkbox" id="enabled" ${checked? "checked" : ""} onchange="${onChange}">
                <label class="form-check-label" for="enabled">Enable biometrics unlock</label>
            </div>
        `

    }

}

Stateful.define("biometrics-settings", BiometricsSettings)
