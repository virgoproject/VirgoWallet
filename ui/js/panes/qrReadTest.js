const html5QrCode = new Html5Qrcode("reader");
const qrCodeSuccessCallback = (decodedText, decodedResult) => {
    console.log(decodedText)
    console.log(decodedResult)
};
const config = { fps: 10, qrbox: { width: 250, height: 250 } };
//html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
