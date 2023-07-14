class QrScannerPane {

    static toggleBtn = document.getElementById("qrCodeToggleBtn")
    static self = document.getElementById("qrScannerPane")
    static backBtn = document.getElementById("qrScannerPaneBack")

    static wcPermPane = document.getElementById("wcPermPane")
    static wcSitename = document.getElementById("wcSitename")

    static wcPermContainer = document.getElementById("wcPermContainer")

    constructor() {

        const html5QrCode = new Html5Qrcode("qrScanner");

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

            _this.displayRequest(req)

        };

        const config = {fps: 10, qrbox: (viewfinderWidth, viewfinderHeight) => {
            console.log(viewfinderWidth)
            console.log(viewfinderHeight)
            let minEdgePercentage = 0.7 // 70%
            let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
            let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
            return {
                width: qrboxSize,
                height: qrboxSize
            }
        }};

        QrScannerPane.toggleBtn.onclick = () => {
            QrScannerPane.self.style.display = "flex"
            html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
        }

        QrScannerPane.backBtn.onclick = () => {
            QrScannerPane.self.style.display = "none"
            html5QrCode.stop()
        }

    }

    displayRequest(req){
        QrScannerPane.wcSitename.innerHTML = req.params.proposer.metadata.url.replaceAll("https://", "").replaceAll("http://", "")
        QrScannerPane.wcPermPane.style.display = "block"

        QrScannerPane.wcPermPane.onclick = () => {
            QrScannerPane.wcPermPane.style.display = "none"
        }

        QrScannerPane.wcPermContainer.onclick = e => {
            e.stopPropagation()
        }
    }

}
hjj
qrScannerPane = new QrScannerPane()
