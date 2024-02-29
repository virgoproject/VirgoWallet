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
                loading
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
                <div class="news" onclick="${onclick}">
                    <div class="titleWrapper">
                        <p class="title text-sm">${article.title}</p>
                        <p class="subtitle text-sm">${article.site + " - " + Utils.timeAgo(article.date)}</p>
                    </div>
                    <div class="newsImg" style="background-image: url('${article.image}')">
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
                margin-right: 0.5em;
            }
        
            .news {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: center;
                justify-content: space-between;
            }
            
            .newsImg {
                height: 64px;
                width: 64px;
                object-fit: cover;
                border-radius: 0.5em;
                background-color: var(--gray-100);
            }
            
            .title {
                color: var(--gray-700);
            }
            
            .subtitle {
                color: var(--gray-400);
                margin: 0;
            }
            
        `;
    }

}

Stateful.define("token-news", TokenNews)
