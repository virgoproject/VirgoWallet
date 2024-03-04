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

        if(loading){
            return `
                <div id="carouselShimmer" class="shimmerBG"></div>
            `
        }

        const rows = []

        let i = 0;
        for(const banner of data){
            const bannerClick = this.registerFunction(() => {
                browser.windows.create({
                    url: banner.url
                })
            })

            rows.push(`
                <div class="carousel-item ${i == 0 ? "active" : ""} shimmerBG" onclick="${bannerClick}">
                        <img src="${"https://raw.githubusercontent.com/virgoproject/walletBanners/main/" + banner.img}" class="d-block w-100 image" alt="">
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
            <div id="carousel" class="carousel slide">
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
            
            #carouselShimmer {
                height: 55px;
                border-radius: 0.5em;
            }
            
            .shimmerBG {
                height: 55px;
            }
        `
    }

}

Stateful.define("home-banners", HomeBanners)
