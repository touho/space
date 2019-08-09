import GameObject from "./gameObject";

export default class Planet extends GameObject {
    radius: number = 200 + Math.random() * 600
    color: string = 'white'
    constructor() {
        super()
        this.position.setScalars(0, 0)
        this.maximumRadius = this.radius

        let r = 50 + 150 * Math.random()
        let g = 50 + 150 * Math.random()
        let b = 50 + 150 * Math.random()
        this.color = `rgb(${r},${g},${b})`
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        context.fill();
    }
}
