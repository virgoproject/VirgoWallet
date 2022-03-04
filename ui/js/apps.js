$(".footerElem").click(function () {
    let data = $(this).attr("data-target")
    let selector = $("#mainPane .header ")
    let selectorStats = $("#mainPane .header .stats")

    switch (data) {
        case "store":
            $("#mainPane .header .stats").hide()
            $("#mainPane .header ").hide()
            $("#mainPane .header").css({"height": "auto", "margin-bottom": "0px"})
            break;
        case "swap" :
            $("#mainPane .header .stats").show()
            $("#mainPane .header ").show()
            $("#mainPane .header").css({"height": "110px", "margin-bottom": "3.5em"})
            $("#mainPane .swapPart").show()

            break;
        default:
            $("#mainPane .header .stats").show()
            $("#mainPane .header ").show()
            $("#mainPane .header").css({"height": "110px", "margin-bottom": "3.5em"})
            break;
    }

})

$(".bodyElem.store .topAppsList").click(function () {
    $(".bodyElem.store").hide()
    $(".bodyElem.selectedApp").show()
})
