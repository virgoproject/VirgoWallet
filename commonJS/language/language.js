class Language {

    static languages = {}

    static selectedLanguage = "en_US"

    static translateDOM(){
        const _this = this
            document.querySelectorAll("*").forEach(elem => {
                if (elem.innerHTML){
                    const Regex = elem.innerHTML.replace(/\{(.*?)\}/g, (match, key) => {
                        if (_this.languages[_this.selectedLanguage][key] !== undefined){
                            return _this.languages[_this.selectedLanguage][key]
                        }
                    })
                    elem.innerHTML = Regex
                }
            })


    }

    static get(dataToTranslate){
        const _this = this
        getBaseInfos().then(function (info){
            return _this.languages[info.selectedLanguage][dataToTranslate]
        })
    }

    static addLanguage(key, value){
        this.languages[key] = value
    }

}

