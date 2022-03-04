$(".footerElem").click(function () {
    let data = $(this).attr("data-target")

    if (data === "swap") {
        $("#mainPane .header .stats").hide()
        $("#mainPane .header ").hide()
        $("#mainPane .header").css({"height" : "auto","margin-bottom":"0px"})
    }

    if (data !== "swap" && $("#mainPane .header .stats").is(":hidden")) {
        $("#mainPane .header .stats").show()
        $("#mainPane .header ").show()
        $("#mainPane .header").css({"height" : "110px","margin-bottom":"3.5em"})


    }

})
