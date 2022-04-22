
function removeAll() {

    $("#footerStore").hide().removeClass("d-flex").css("background", "")
    $("#footeresume").hide().removeClass("d-flex").css("background", "")
    $("#footerpay").hide().removeClass("d-flex")
    $('[data-target="send"]').css("background", "")
    $('[data-target="resume"]').css("background", "")
    $('[data-target="store"]').css("background", "")
}


/*$('[data-target="send"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footerpay").addClass("d-flex").show()

})

$('[data-target="resume"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footeresume").addClass("d-flex").show()

})

$('[data-target="store"]').hover(function () {
    removeAll()
    $(this).css("background", "hsl(275, 100%, 31%, 10%)")
    $("#footerStore").addClass("d-flex").show()

})*/

$("#footerAlt").on( "mouseleave", function() {
    removeAll()
})