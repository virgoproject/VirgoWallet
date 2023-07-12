class QrScannerPane {

    static toggleBtn = document.getElementById("qrCodeToggleBtn")
    static self = document.getElementById("qrScannerPane")
    static backBtn = document.getElementById("qrScannerPaneBack")

    constructor() {

        const html5QrCode = new Html5Qrcode("qrScanner");

        let errorCooldown = false

        const qrCodeSuccessCallback = (decodedText) => {
            if(errorCooldown) return

            errorCooldown = true

            setTimeout(() => {
                errorCooldown = false
            }, 4000)

            notyf.error("Invalid QR code")

            console.log(decodedText)
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

}

qrScannerPane = new QrScannerPane()
