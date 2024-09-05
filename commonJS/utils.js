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

        if(amount.endsWith("."))
            amount = amount.slice(0, -1)

        return amount
    }

    static beautifyAmount(amount){
        if(typeof amount != "number")
            amount = parseFloat(amount)

        if(amount > 1000000000)
            return Utils.reduceDecimals(amount/1000000000).toLocaleString('en-US') + " Bn"

        if(amount > 1000000)
            return Utils.reduceDecimals(amount/1000000).toLocaleString('en-US') + "M"

        if(amount < 0.001)
            return Utils.reduceDecimals(amount)

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
        amount = ""+amount
        let dotIndex = amount.indexOf(".")
        if(dotIndex < 0)
            dotIndex = amount.length-1
        const zerosToAdd = decimals - (amount.length - (dotIndex+1))
        let res = amount.replace(".", "") + "0".repeat(zerosToAdd)
        while(res.startsWith("0"))
            res = res.substring(1)
        return res
    }

    static isValidNumber(str) {
        // Regular expression to match valid numbers
        const numberRegex = /^(?!.*e)[+-]?\d*\.?\d+$/;

        return numberRegex.test(str);
    }

    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (err) {
            return false;
        }
    }

    static timeAgo(timestamp) {
        const now = Date.now();
        const secondsAgo = Math.floor((now - timestamp) / 1000);

        if (secondsAgo < 60) {
            return `${secondsAgo}s ago`;
        } else if (secondsAgo < 3600) {
            const minutes = Math.floor(secondsAgo / 60);
            return `${minutes}m ago`;
        } else if (secondsAgo < 86400) {
            const hours = Math.floor(secondsAgo / 3600);
            return `${hours}h ago`;
        } else if (secondsAgo < 172800) {
            // 172800 seconds = 2 days
            return 'yesterday';
        } else {
            const date = new Date(timestamp);
            const day = date.getDate();
            const month = date.getMonth() + 1; // Months are zero-indexed
            const year = date.getFullYear() % 100; // Get last two digits of the year

            return `${day}/${month}/${year < 10 ? '0' : ''}${year}`;
        }
    }

    static cutTo4Decimals(number){
        return this.cutTo3Decimals(number)
    }

    static cutTo3Decimals(number) {
        let numString = String(number)

        let res = ""

        let reachedDecimal = false
        let nonZeroNb = 0
        for(const char of numString){
            res += char
            if((reachedDecimal && nonZeroNb > 0) || (reachedDecimal && char != "0")) nonZeroNb++
            if(nonZeroNb >= 3) break
            if(char == ".") reachedDecimal = true
        }

        return res
    }

}
