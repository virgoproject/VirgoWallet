window.onload = () => {


    $("#btnChains").click(function () {
        let displayChain = $("#chain").css("display")
        if (displayChain == "none"){
            $("#chain").show();
        }else {
            $("#chain").hide();
        }
    });

    $("#selectChains  > li").click(function (){
        $("#chain").hide();
    })

}