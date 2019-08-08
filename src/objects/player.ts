import Actor from "./actor";
import {keyPressed, key} from "../util/input";
import Vector from "../util/Vector";

const TURN_SPEED = 1.4
const ACCELERATION = 100
const MAX_SPEED = 100

export default class Player extends Actor {
    speed: Vector = new Vector(0, 0)

    angle: number = Math.PI / 2

    constructor() {
        super()

        this.position.setScalars(150, 150)
    }
    update(dt: number, time: number) {
        if (keyPressed(key.up)) {
            this.speed.addScalars(Math.sin(this.angle) * dt * ACCELERATION, -Math.cos(this.angle) * dt * ACCELERATION)
            if (this.speed.length() > MAX_SPEED) {
                this.speed.setLength(MAX_SPEED)
            }
        }
        if (keyPressed(key.left)) {
            this.angle -= dt * TURN_SPEED
        }
        if (keyPressed(key.right)) {
            this.angle += dt * TURN_SPEED
        }

        console.log('dt', dt)
        console.log('speed', this.speed)
        console.log('pos', this.position)

        this.position.add(this.speed.clone().multiplyScalar(dt))

        // break in the air
        this.speed.setLength(Math.max(0, this.speed.length() * (1 - 0.1 * dt) - dt * 5))
    }
    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = 'gold'

        context.beginPath();
        context.arc(this.position.x, this.position.y, 30, Math.PI + this.angle, 0 + this.angle, false);
        context.fill();
    }
}
