class Cell {
    constructor(i, isRevealed, isMine, nearbyMinesAm) {
        this.i = i
        this.isRevealed = isRevealed
        this.isMine = isMine
        this.nearbyMinesAm = nearbyMinesAm
    }

    getI() {
        return this.i
    }

    getIsRevealed() {
        return this.isRevealed
    }

    getIsMine() {
        return this.isMine
    }

    getNearbyMinesAm() {
        return this.nearbyMinesAm
    }

    setIsRevealed(value = true) {
        this.isSeen = value
    }

    setNearbyMines(value = this.nearbyMinesAm) {
        this.nearbyMinesAm = value
    }
}