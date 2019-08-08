import Vector from "../util/Vector";

export default class GameObject {
    position: Vector = new Vector(0, 0)
    constructor() {
    }
    update(dt: number, time: number) {
    }
    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'red'
        context.fillRect(this.position.x, this.position.y, 5, 5)
    }
}
