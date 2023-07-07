class QrScannerPane {

    static toggleBtn = document.getElementById("qrCodeToggleBtn")
    static self = document.getElementById("qrScannerPane")
    static backBtn = document.getElementById("qrScannerPaneBack")

    constructor() {

        const html5QrCode = new Html5Qrcode("qrScanner");
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(decodedText)
            console.log(decodedResult)
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
