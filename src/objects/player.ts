import Actor from "./actor";
import {key, keyPressed} from "../util/input";
import Vector from "../util/Vector";
import {Level} from "../gameContext";

const TURN_SPEED = 0.8
const ACCELERATION = 50
const MAX_SPEED = 100

export default class Player extends Actor {
    speed: Vector = new Vector(0, 0)

    angle: number = Math.PI / 2

    constructor(level: Level) {
        super(level)
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

        this.position.add(this.speed.clone().multiplyScalar(dt))

        if (this.level === Level.PLANET) {
            // break in the air
            this.speed.setLength(Math.max(0, this.speed.length() * (1 - 0.1 * dt) - dt * 5))
        } else if (this.level === Level.SOLAR_SYSTEM) {
            this.speed.setLength(Math.max(0, this.speed.length() * (1 - 0.02 * dt) - dt * 3))
        }
    }
    draw(context: CanvasRenderingContext2D) {

        context.save()

        context.translate(this.position.x, this.position.y)
        context.rotate(this.angle)

        context.strokeStyle = 'rgba(100,50,0,0.5)'

        context.beginPath();
        context.moveTo(0, -30)
        context.lineTo(20, 20)
        context.lineTo(-20, 20)
        context.closePath()
        context.stroke()

        context.fillStyle = 'white'
        context.fillRect(-16, 18, 6, 9)
        context.fillRect(10, 18, 6, 9)

        context.fillStyle = 'red'
        context.fillRect(-18, 18, 10, 7)
        context.fillRect(8, 18, 10, 7)


        context.fillStyle = 'gold'

        context.beginPath();
        context.moveTo(0, -30)
        context.lineTo(20, 20)
        context.lineTo(-20, 20)
        context.closePath()
        context.fill()

        context.fillStyle = 'rgba(70,10,10, 0.9)'

        context.beginPath();
        context.moveTo(0, -20)
        context.lineTo(6, 0)
        context.lineTo(-6, 0)
        context.closePath()
        context.fill()

        // context.arc(this.position.x, this.position.y, 30, Math.PI + this.angle, 0 + this.angle, false);

        context.restore()
    }
}
