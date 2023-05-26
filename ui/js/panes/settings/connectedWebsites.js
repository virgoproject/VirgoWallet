$('#connectedWebsites').click(function () {
    $('.listSite').html("")
    getBaseInfos().then(res => {
        res = res.connectedSites
        if (res.length <= 0 || res.length === undefined){
            $(".settingsPane .noTracked").show()
        }
        for(let l = 0; l < res.length; l++){
            const element = $("#trakeExemple").clone()
            element.attr('id','')
            const siteUrl = res[l].replace(/(^\w+:|^)\/\//, '')
            element.find(".signedSite").html(siteUrl).attr('data-site',res[l])
            element.find(".imgAffiliated").attr('src','https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url='+ res[l] +'&size=128')
            element.find("i").click(function () {
                const elementSite = element.find(".signedSite").attr('data-site')
                deleteConnectedSite(elementSite).then(res => {
                        if (res.accepted) {
                            element.remove()
                            if (res.siteLength <= 0){
                                $(".settingsPane .noTracked").show()
                            }
                        }
                    }
                )
            })
            $('.listSite').append(element)
            element.show()
        }
    })
})
