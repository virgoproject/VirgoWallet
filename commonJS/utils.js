class Utils {

    static formatAmount(amount, decimals){
        return amount/Math.pow(10, decimals);
    }

    static beautifyAmount(amount){
        if(amount > 1000000000)
            return Utils.reduceDecimals(amount/1000000000).toLocaleString('en-US') + " Bn"

        if(amount > 1000000)
            return Utils.reduceDecimals(amount/1000000).toLocaleString('en-US') + "M"

        return Utils.reduceDecimals(amount).toLocaleString('en-US')
    }

    static reduceDecimals(amount){
        if(amount == 0 || amount % 1 == 0) return amount;

        let precision = 2;
        if(amount < 1)
            precision = 4;

        return parseFloat(amount.toFixed(Math.floor(Math.abs(Math.log10(amount % 1)))+precision))
    }

    static hexToUtf8(hex) {
        return decodeURIComponent(
            hex.replace("0x", "")
                .replace(/\s+/g, '') // remove spaces
                .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
        );
    }

}