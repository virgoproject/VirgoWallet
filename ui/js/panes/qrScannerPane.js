class QrScannerPane {

    static toggleBtn = document.getElementById("qrCodeToggleBtn")
    static self = document.getElementById("qrScannerPane")
    static backBtn = document.getElementById("qrScannerPaneBack")

    static wcPermPane = document.getElementById("wcPermPane")
    static wcSitename = document.getElementById("wcSitename")
    static wcPermContainer = document.getElementById("wcPermContainer")

    static wcSiteLogo = document.getElementById("wcSiteLogo")

    static wcAllowBtn = document.getElementById("wcAllow")

    static wcRefuseBtn = document.getElementById("wcRefuse")

    static wcClose = document.getElementById("wcClose")


    constructor() {

        this.html5QrCode = new Html5Qrcode("qrScanner");

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
            this.html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
        }

        QrScannerPane.backBtn.onclick = () => {
            QrScannerPane.self.style.display = "none"
            this.html5QrCode.stop()
        }

    }

    displayRequest(req){
        const _this = this

        QrScannerPane.wcSitename.innerHTML = req.params.proposer.metadata.url.replaceAll("https://", "").replaceAll("http://", "")
        QrScannerPane.wcPermPane.style.display = "block"

        if(req.params.proposer.metadata.icons !== undefined)
            QrScannerPane.wcSiteLogo.src = req.params.proposer.metadata.icons[req.params.proposer.metadata.icons.length-1]

        QrScannerPane.wcPermPane.onclick = () => {
            QrScannerPane.wcPermPane.style.display = "none"
            walletConnect.refuse(req)
            _this.cooldown = false
        }

        QrScannerPane.wcPermContainer.onclick = e => {
            e.stopPropagation()
        }

        QrScannerPane.wcAllowBtn.onclick = e => {
            QrScannerPane.wcPermPane.style.display = "none"
            walletConnect.allow(req)
            _this.cooldown = false
            QrScannerPane.self.style.display = "none"
            _this.html5QrCode.stop()
            notyf.success("Successfully connected!")
        }

        QrScannerPane.wcRefuseBtn.onclick = e => {
            QrScannerPane.wcPermPane.style.display = "none"
            walletConnect.refuse(req)
            _this.cooldown = false
        }

        QrScannerPane.wcClose.onclick = e => {
            QrScannerPane.wcPermPane.style.display = "none"
            walletConnect.refuse(req)
            _this.cooldown = false
        }

    }

}

qrScannerPane = new QrScannerPane()
