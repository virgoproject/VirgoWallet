function currencyToSymbol(currency){
    switch (currency){
        case "usd": return "&dollar;"
        case "eur": return "&euro;"
        case "jpy": return "&yen;"
        case "gbp": return "&pound;"
        case "idr": return "Rp"
        case "php": return "&#8369;"
        case "pkr": return "Rs"
        case "sgd": return "S$"
        case "inr": return "&#8377;"
        case "cny": return "&#20803;"
        case "krw": return "&#8361;"
        case "myr": return "RM"
        case "thb": return "&#3647;"
        case "rub": return "&#8381;"
        case "aud": return "A$"
        case "cad": return "CA$"
        case "hkd": return "HK$"
        case "ngn": return "&#8358;"
        default: return currency
    }
}
