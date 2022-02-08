class Utils {

    static formatAmount(amount, decimals){
        return amount/Math.pow(10, decimals);
    }

    static beautifyAmount(amount){
        if(amount == 0 || amount % 1 == 0) return amount;

        return amount.toFixed(Math.floor(Math.abs(Math.log10(amount % 1)))+1)
    }

}