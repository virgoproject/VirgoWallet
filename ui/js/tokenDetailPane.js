class TokenDetailPane {

    static self = $("#tokenDetailPane")
    static back = $("#tokenDetailPane .back")
    static name = $("#tokenDetailPane .name")

    constructor() {

        TokenDetailPane.back.click(function(){
            TokenDetailPane.self.hide()
        })

    }

    displayToken(data){
        TokenDetailPane.name.html(data.name)
        TokenDetailPane.self.show()
    }

}

const tokenDetailPane = new TokenDetailPane()