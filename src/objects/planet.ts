import GameObject from "./gameObject";
import {Level} from "../gameContext";
import Vector from "../util/Vector";
import {time} from "../scene";

export default class Planet extends GameObject {
    radius: number = 200 + Math.random() * 600
    color: string = 'white'
    distanceFromCenter: number = 0
    angleOffset: number = 0
    angleSpeed: number = 0

    innerLevelRadius = 200
    outerLevelRadius = 400
    constructor(level: Level) {
        super(level)

        if (level === Level.PLANET) {
            this.position.setScalars(0, 0)
        } else if (level === Level.SOLAR_SYSTEM) {
            this.distanceFromCenter = 900 + Math.random() * 1800
            this.radius = 40 + Math.random() * 80

            this.angleOffset = Math.random() * Math.PI * 2
            this.angleSpeed = 60000 / Math.pow(this.distanceFromCenter, 2) //  0.01 + Math.random() * 0.02

            this.update(0, time)
        }

        this.maximumRadius = this.radius

        let r = 50 + 150 * Math.random()
        let g = 50 + 150 * Math.random()
        let b = 50 + 150 * Math.random()
        this.color = `rgb(${r},${g},${b})`

        if (this.level === Level.SOLAR_SYSTEM) {
            this.maximumRadius = 300 // Outer transition radius
        }
    }

    setSun() {
        this.position.setScalars(0, 0)
        this.radius = 600
        this.maximumRadius = this.radius
        this.color = 'gold'

        this.distanceFromCenter = 0
    }

    update(dt: number, time: number) {
        this.position.set(new Vector(this.distanceFromCenter, 0).rotate(this.angleOffset + time * this.angleSpeed))
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        context.fill();

        if (this.level === Level.SOLAR_SYSTEM && !this.position.isZero()) {
            context.strokeStyle = 'blue'
            context.lineWidth = 1

            context.beginPath()
            context.arc(this.position.x, this.position.y, this.innerLevelRadius, 0, Math.PI * 2, false)
            context.stroke()

            context.strokeStyle = 'purple'

            context.beginPath()
            context.arc(this.position.x, this.position.y, this.outerLevelRadius, 0, Math.PI * 2, false)
            context.stroke()
        }
    }
}
