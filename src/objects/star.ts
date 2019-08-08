import GameObject from "./gameObject";

export default class Star extends GameObject {
    constructor() {
        super()
        this.position.setScalars(Math.random() * 1400, Math.random() * 400)
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'white'
        context.fillRect(this.position.x, this.position.y, 5, 5)
    }
}
