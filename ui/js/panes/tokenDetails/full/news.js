class TokenNews extends StatefulElement {

    render() {
        const {data, loading} = this.useFunction(async () => {
            const res = await fetch("https://www.toptal.com/developers/feed2json/convert?url=https://watcher.guru/news/feed")
            const json = await res.json()

            const news = []

            for(const item of json.items){
                let image = item.content_html.match(/(https?:\/\/[^\s]+?\.jpg)/)
                if(Array.isArray(image))
                    image = image[0]

                news.push({
                    title: item.title,
                    url: item.url,
                    image,
                    date: Date.parse(item.date_published),
                    site: "Watcher.guru"
                })
            }

            return news
        })

        if(loading){
            return `
                <div class="px-3">
                    <div class="news mb-4">
                        <div class="titleWrapper">
                            <div>
                                <div class="titleShimmer shimmerBG"></div>
                                <div class="titleShimmer2 shimmerBG"></div>       
                            </div>
                            <div class="subtitleShimmer shimmerBG"></div>
                        </div>
                        <div class="newsImg shimmerBG"></div>
                    </div>
                    <div class="news mb-4">
                        <div class="titleWrapper">
                            <div>
                                <div class="titleShimmer shimmerBG"></div>
                                <div class="titleShimmer2 shimmerBG"></div>       
                            </div>
                            <div class="subtitleShimmer shimmerBG"></div>
                        </div>
                        <div class="newsImg shimmerBG"></div>
                    </div>
                    <div class="news mb-4">
                        <div class="titleWrapper">
                            <div>
                                <div class="titleShimmer shimmerBG"></div>
                                <div class="titleShimmer2 shimmerBG"></div>       
                            </div>
                            <div class="subtitleShimmer shimmerBG"></div>
                        </div>
                        <div class="newsImg shimmerBG"></div>
                    </div>
                    <div class="news mb-4">
                        <div class="titleWrapper">
                            <div>
                                <div class="titleShimmer shimmerBG"></div>
                                <div class="titleShimmer2 shimmerBG"></div>       
                            </div>
                            <div class="subtitleShimmer shimmerBG"></div>
                        </div>
                        <div class="newsImg shimmerBG"></div>
                    </div>
                    <div class="news mb-4">
                        <div class="titleWrapper">
                            <div>
                                <div class="titleShimmer shimmerBG"></div>
                                <div class="titleShimmer2 shimmerBG"></div>       
                            </div>
                            <div class="subtitleShimmer shimmerBG"></div>
                        </div>
                        <div class="newsImg shimmerBG"></div>
                    </div>
                </div>
            `
        }

        const rows = []

        for(const article of data){
            const onclick = this.registerFunction(() => {
                browser.windows.create({
                    url: article.url
                })
            })

            rows.push(`
                <div class="news mb-4" onclick="${onclick}">
                    <div class="titleWrapper">
                        <p class="title text-sm">${article.title}</p>
                        <p class="subtitle text-sm">${article.site + " - " + Utils.timeAgo(article.date)}</p>
                    </div>
                    <div class="newsImg" style="background-image: url('${article.image}')"></div>
                </div>
            `)
        }

        return `
            <div class="mt-3 px-3">
                ${rows}
            </div>
        `;
    }

    style() {
        return `
            .titleWrapper {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
                margin-right: 1em;
            }
        
            .news {
                display: flex;
                flex-flow: row;
                align-items: center;
                justify-content: space-between;
                height: 64px;
                cursor: pointer;
            }
            
            .newsImg {
                height: 64px;
                width: 64px;
                border-radius: 0.5em;
                background-color: var(--gray-100);
                background-size: contain;
                min-width: 64px;   
            }
            
            .title {
                color: var(--gray-700);
                margin: 0;
            }
            
            .subtitle {
                color: var(--gray-400);
                margin: 0;
            }
            
            .titleShimmer {
                border-radius: 0.5em;
                height: 0.875em;
                width: 20ch;
                margin: 0.1875em 0;
            }
            
            .titleShimmer2 {
                border-radius: 0.5em;
                height: 0.875em;
                width: 8ch;
            }
            
            .subtitleShimmer {
                border-radius: 0.5em;
                height: 0.875em;
                width: 12ch;
            }
            
        `;
    }

}

Stateful.define("token-news", TokenNews)
