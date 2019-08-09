import GameObject from "./gameObject";

export default class Star extends GameObject {
    radius: number = 2 + Math.random() * 3
    alpha: number = 0.3 + 0.5 * Math.random()
    constructor() {
        super()
        this.position.setScalars(Math.random() * 10000 - 5000, Math.random() * 10000 - 5000)
        this.maximumRadius = 6
    }

    draw(context: CanvasRenderingContext2D) {
        const alpha = this.alpha + Math.random() * 0.1
        context.fillStyle = `rgba(255, 255, 255, ${alpha})`
        context.fillRect(this.position.x, this.position.y, this.radius, this.radius)
    }
}
