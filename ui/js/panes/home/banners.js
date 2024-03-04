class HomeBanners extends StatefulElement {

    eventHandlers() {
        if(!this.querySelector("#carousel")) return

        try {
            $(this).find("#carousel").carousel({
                interval: 4000
            })
        }catch(e){
            console.log(e)
        }

    }

    async render() {

        const {data, loading} = this.useFunction(async () => {
            const res = await fetch("https://raw.githubusercontent.com/virgoproject/walletBanners/main/data.json")
            const json = await res.json()
            return json
        })

        if(loading) return ""

        const rows = []

        let i = 0;
        for(const banner of data){
            const bannerClick = this.registerFunction(() => {
                browser.windows.create({
                    url: banner.url
                })
            })

            rows.push(`
                <div class="carousel-item ${i == 0 ? "active" : ""}" onclick="${bannerClick}">
                        <img src="${"https://raw.githubusercontent.com/virgoproject/walletBanners/main/" + banner.img}" class="d-block w-100 image" alt="...">
                </div>
            `)
            i++
        }

        const prevClick = this.registerFunction(() => {
            $(this).find("#carousel").carousel("prev")
        })

        const nextClick = this.registerFunction(() => {
            $(this).find("#carousel").carousel("next")
        })

        return `
            <div id="carousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner" id="carousel-inner">
                    ${rows}
                </div>
                <button class="carousel-control-prev control" type="button" onclick="${prevClick}">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next control" type="button" onclick="${nextClick}">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        `;
    }

    style(){
        return `
            .#carousel {
                padding: 0.8em 0em;
                top: -5px;
                border-radius: 0.5em;
                padding-top: 0.5em;
            }
            
            #carousel-inner {
                border-radius: 0.5em;
            }
            
            .control {
                display: none;
                z-index: 0!important;
            }
            
            #carousel:hover .control {
                display: block;
            }
        `
    }

}

Stateful.define("home-banners", HomeBanners)