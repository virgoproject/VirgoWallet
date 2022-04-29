class PendingTxsPane {

    static btn = $("#mainPane .header .pendingTxs")
    static self = $("#pendingTxsPane")
    static back = $("#pendingTxsPane .back")

    constructor() {
        PendingTxsPane.btn.click(function(){
            PendingTxsPane.self.show()
        })

        PendingTxsPane.back.click(function(){
            PendingTxsPane.self.hide()
        })
    }

}

const pendingTxsPane = new PendingTxsPane()
