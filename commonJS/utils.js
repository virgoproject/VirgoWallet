class Utils {

    static formatAmount(amount, decimals){
        return amount/Math.pow(10, decimals);
    }

    static beautifyAmount(amount){
        if(amount == 0 || amount % 1 == 0) return amount;

        return amount.toFixed(Math.floor(Math.abs(Math.log10(amount % 1)))+1)
    }

    static hexToUtf8(hex) {
        return decodeURIComponent(
            hex.replace("0x", "")
                .replace(/\s+/g, '') // remove spaces
                .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
        );
    }

}