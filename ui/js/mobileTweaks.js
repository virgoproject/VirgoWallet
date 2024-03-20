
const setMobileTweaks = () => {
    //add device-width viewport
    const viewportElem = document.createElement('meta')
    viewportElem.name = "viewport"
    viewportElem.content = "width=device-width, initial-scale=1.0, user-scalable=no"
    document.getElementsByTagName('head')[0].appendChild(viewportElem)

    //set body height/width to 100vh/vw
    const body = document.getElementsByTagName("body")[0]
    body.style.height = "100vh"
    body.style.width = "100vw"

    document.isMobile = true

}

setMobileTweaks()
