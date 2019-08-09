import GameObject from "./gameObject";
import {Level} from "../gameContext";

export default class Star extends GameObject {
    radius: number = 2 + Math.random() * 3
    alpha: number = 0.3 + 0.6 * Math.random()
    color: string
    constructor(level: Level) {
        super(level)
        this.position.setScalars(Math.random() * 10000 - 5000, Math.random() * 10000 - 5000)
        this.maximumRadius = 6

        this.color = `rgba(255, 255, 255, ${this.alpha})`
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color
        context.fillRect(this.position.x, this.position.y, this.radius, this.radius)
    }
}
