class SettingsBackupSeed extends StatefulElement {

    constructor() {
        super();
    }

    render() {
        const _this = this

        const [step, setStep] = this.useState("step", 0)

        const back = this.registerFunction(() => {
            if(step == 0){
                _this.remove()
                return
            }

            setStep(step-1);
        })

        if(step == 2 && this.forwardToNewPassword){
            const elem = document.createElement("settings-new-password")
            elem.bypassShow = true
            if(_this.setup) elem.setup = true
            document.body.appendChild(elem)
            this.remove()
            return
        }

        let title = "Your Seed Phrase"

        if(step == 1) title = "Confirm Your Seed Phrase"
        if(step == 2) title = "All done!"

        const {data, loading} = this.useInterval(async () => {
            const res = await getMnemonic()

            return res
        }, 10000)

        if(loading) return

        let content;

        if(step == 0) content = this.seed(data, setStep)
        if(step == 1) content = this.confirm(data, setStep)
        if(step == 2) content = this.finish()

        return `
            <div class="fullpageSection">
                <section-header title="${title}" backfunc="${back}"></section-header>
                <div id="content" class="text-center">
                    ${content}
                </div>
            </div>
        `;
    }

    seed(data, setStep){
        const words = []

        let i = 1;

        for(const word of data.split(" ")){
            words.push(`<div class="col-6 wordWrapper ${i % 2 == 0 ? "right" : "left"}"><p class="word"><span class="wordIndex">${i}. </span>${word}</p></div>`)
            i++
        }

        const nextClick = this.registerFunction(() => {
            setStep(1)
        })

        const copyClick = this.registerFunction(() => {
            copyToClipboard(data);
            notyf.success("Copied to clipboard!");
        })

        return `
            <p class="text-gray-700">This phrase permits you to recover your wallet in case of loss. <b>Write it down
                on paper and keep it safe</b>, away from regard.</p>
            <div class="row">
                ${words}
            </div>
            <p id="copy" class="mt-3" onclick="${copyClick}"><i class="fa-solid fa-copy"></i> Copy to clipboard</p>
            <div id="nextWrapper">
                <button class="button w-100" onclick="${nextClick}">Continue</button>
            </div>
        `
    }

    confirm(data, setStep){
        const _this = this

        const fakeWords = [
            "abandon",
            "ability",
            "banana",
            "carpet",
            "deposit",
            "elbow",
            "fashion",
            "hazard",
            "inflate",
            "journey",
            "lantern",
            "melody",
            "notice",
            "orchard",
            "peanut",
            "relax",
            "sprinkle",
            "trophy",
            "victory",
            "wizard"
        ];

        const words = data.split(" ")

        const rows = []
        let toGuess = []
        const usedFakes = []

        let p = -1;

        while((p == -1 || toGuess.includes(p)) && toGuess.length < 3){
            p = Math.floor(Math.random() * words.length)
            if(!toGuess.includes(p)){
                toGuess.push(p)
            }
        }

        toGuess.sort(function(a, b) {
            return a - b;
        });

        const onWordChange = this.registerFunction(() => {
            _this.querySelector("#confirmWords").disabled = !(
                _this.querySelector("input[name='0']:checked")
                &&_this.querySelector("input[name='1']:checked")
                && _this.querySelector("input[name='2']:checked")
            )
        })

        const btnClick = this.registerFunction(() => {
            if(_this.querySelector("input[name='0']:checked").hasAttribute("valid")
                && _this.querySelector("input[name='1']:checked").hasAttribute("valid")
                && _this.querySelector("input[name='2']:checked").hasAttribute("valid")){
                setStep(2)
            }else{
                notyf.error("Chosen words are invalid!")
            }
        })

        for(let i = 0; i < 3; i++){
            const pick = toGuess[i]

            const position = Math.floor(Math.random() * 3)

            const cols = []

            for(let j = 0; j < 3; j++){
                if(j == position){
                    cols.push(`<div class="col-4 ${j == 0 ? "pr-1" : ""} ${j == 1 ? "pl-1 pr-1" : ""} ${j == 2 ? "pl-1" : ""}">
                        <input type="radio" class="btn-check" name="${i}" id="${words[pick]}" autocomplete="off" onchange="${onWordChange}" valid="true">
                        <label class="btn btn-primary w-100 shadow-none" for="${words[pick]}">${words[pick]}</label>
                    </div>`)

                    continue;
                }

                let fakeWord = 0;

                while(fakeWord == 0 || usedFakes.includes(fakeWord) || words.includes(fakeWord)){
                    fakeWord = fakeWords[Math.floor(Math.random() * fakeWords.length)]
                }

                usedFakes.push(fakeWord)

                cols.push(`<div class="col-4 ${j == 0 ? "pr-1" : ""} ${j == 1 ? "pl-1 pr-1" : ""} ${j == 2 ? "pl-1" : ""}">
                        <input type="radio" class="btn-check" name="${i}" id="${fakeWord}" autocomplete="off" onchange="${onWordChange}">
                        <label class="btn btn-primary w-100 shadow-none" for="${fakeWord}">${fakeWord}</label>
                    </div>`)

            }

            rows.push(`
                <p class="text-left mb-1 text-sm label">Word #${pick+1}</p>
                <div class="row mb-4" data-toggle="buttons">
                    ${cols}
                </div>
            `)
        }

        return `
            <p class="text-gray-400">Please select the right answers between the words below</p>
            ${rows}
            <div id="nextWrapper">
                <button class="button w-100" id="confirmWords" disabled onclick="${btnClick}">Confirm</button>
            </div>
        `
    }

    finish(){
        const _this = this

        const btnClick = this.registerFunction(() => {
            _this.remove()
        })

        return `
            <div class="text-center"><i class="fa-solid fa-circle-check text-green-400 text-7xl"></i></div>
            <p class="text-gray-700 mt-3"><b>Seed phrase successfully saved!</b></p>
            <p class="text-gray-400">Don't forget, never share this phrase to anyone, it can be used to steal your funds!</p>
            <div id="nextWrapper">
                <button class="button w-100" onclick="${btnClick}">Finish</button>
            </div>
        `
    }

    style() {
        return `
            #content {
                padding: 1em;
            }
        
            .word {
                background-color: var(--gray-50);
                padding: 0.5em;
                border-radius: 0.5em;
                margin: 0px;
                color: var(--gray-700);
                font-weight: 600;
            }
            
            .wordWrapper.left {
                padding-right: 0.25em !important;
                padding-top: 0.25em !important;
                padding-bottom: 0.25em !important;
            }
            
            .wordWrapper.right {
                padding-left: 0.25em !important;
                padding-top: 0.25em !important;
                padding-bottom: 0.25em !important;
            }
            
            #nextWrapper {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 1em;
            }
            
            .btn-primary {
                background-color: var(--gray-50)!important;
                color: var(--gray-700)!important;
                text-decoration: none!important;
                border-color: transparent!important;
            }
            
            .btn-check:checked + .btn-primary {
                background-color: var(--main-700)!important;
                color: white!important;
                border-color: var(--main-700)!important;
            }
            
            .wordIndex {
                user-select: none !important;
                color: var(--gray-400);
                font-weight: 500;
            }
            
            img {
                width: 100%;
                margin-bottom: 1em;
                margin-top: 2em;
            }
            
            #copy {
                color: var(--main-700);
                cursor: pointer;
                user-select: none;
            }
        `;
    }

}

Stateful.define("settings-backup-seed", SettingsBackupSeed)
