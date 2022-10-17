class AtomicSwapPane {

    static self = $("#atomicSwapPane")
    static back = $("#atomicSwapBack")

    constructor() {

        AtomicSwapPane.back.click(() => {
            self.hide()
        })

    }

}

atomicSwap = new AtomicSwapPane()
