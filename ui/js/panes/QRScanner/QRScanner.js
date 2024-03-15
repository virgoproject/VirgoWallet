class QRScannerPane extends StatefulElement {

    static init(){
        const elem = document.createElement("qr-scanner-pane")
        const scanner = document.createElement("div")
        scanner.id = "scanner"
        scanner.style.width = "100vw"
        elem.appendChild(scanner)
        document.body.appendChild(elem)
    }

    eventHandlers() {
        this.html5QrCode = new Html5Qrcode("scanner")

        this.cooldown = false

        const _this = this

        const qrCodeSuccessCallback = async (decodedText) => {

            if(_this.cooldown) return

            _this.cooldown = true

            const req = await walletConnect.connect(decodedText)

            console.log(req)

            if(req == false){
                setTimeout(() => {
                    _this.cooldown = false
                }, 4000)

                notyf.error("Invalid QR code")

                return
            }

            const elem = document.createElement("qr-scanner-request")
            elem.req = req
            elem.removeParent = () => {
                _this.html5QrCode.stop()
                _this.remove()
            }
            elem.resetCooldown = () => {
                _this.cooldown = false
            }
            document.body.appendChild(elem)

        };

        const config = {fps: 10, qrbox: (viewfinderWidth, viewfinderHeight) => {

                if(viewfinderHeight == 0)
                    viewfinderHeight = window.innerHeight

                if(viewfinderWidth == 0)
                    viewfinderWidth = window.innerWidth

                let minEdgePercentage = 0.7 // 70%
                let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
                let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
                return {
                    width: qrboxSize,
                    height: qrboxSize
                }
            }};

        this.html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
    }

    render() {

        const _this = this

        const back = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="fullpageSection">
                <i class="fa-solid fa-chevron-left" id="back" onclick="back"></i>
                <slot></slot>
                <i class="fas fa-spinner fa-pulse"></i>
            </div>
        `;
    }

    style() {
        return `
            .fullpageSection {
                background: black!important;
                align-items: center;
                display: flex;
            }
            
            #back {
                position: absolute;
                left: 1em;
                top: 1em;
                font-size: 1.5em;
                color: white;
                cursor: pointer;
                z-index: 10000000000000;
            }
        `;
    }

}

Stateful.define("qr-scanner-pane", QRScannerPane)
