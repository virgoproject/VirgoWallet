class Utils {

    static formatAmount(amount, decimals){
        if(amount == 0) return 0

        amount = ""+amount//make sdure amount is a string

        if(amount.length < decimals)
            amount = "0".repeat(decimals - amount.length) + amount

        amount = amount.substring(0, amount.length-decimals) + "." + amount.substring(amount.length-decimals)

        if(amount.startsWith("."))
            amount = "0" + amount

        while(amount.endsWith("0"))
            amount = amount.slice(0, -1)

        return amount
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

    static precisionRound(number, precision) {
        const factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }

    static toAtomicString(amount, decimals){
        const zerosToAdd = decimals - (amount.length - (amount.indexOf(".")+1))
        const res = amount.replace(".", "") + "0".repeat(zerosToAdd)
        if(res.startsWith("0"))
            return res.substring(1)
        return res
    }

}
