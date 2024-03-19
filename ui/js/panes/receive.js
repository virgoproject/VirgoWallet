class ReceivePopup extends StatefulElement {

    eventHandlers() {
        if(this.address === undefined) return
        this.querySelector("#qrcode").innerHTML = ""
        new QRCode(this.querySelector("#qrcode"), this.address)
    }

    async render() {
        const _this = this

        const {data, loading} = this.useFunction(async () => {
            const baseInfos = await getBaseInfos()
            return baseInfos.addresses[baseInfos.selectedAddress].address
        })

        if(loading) return ""

        this.address = data

        const back = this.registerFunction(() => {
            _this.remove()
        })

        const onClick = this.registerFunction(() => {
            copyToClipboard(data);
            notyf.success("Address copied to clipboard!");
        })

        return `
            <bottom-popup onclose="${back}">
                <section-header title="Receive" no-padding></section-header>
                <div id="qrcode" class="mt-2"></div>
                <div class="input-copiable mt-3" onclick="${onClick}">
                    <p class="input">${data}</p>
                    <i class="fa-regular fa-copy"></i>
                </div>
            </bottom-popup>
        `;
    }

    style() {
        return `
            #qrcode {
                width: fit-content;
                margin: auto;
            }
        `;
    }

}

Stateful.define("receive-popup", ReceivePopup)
