import {eventDispatcher, GameEvent} from "./util/eventDispatcher";
import GameObject from "./objects/gameObject";
import {listenKeyDown, key} from "./util/input";
import Player from "./objects/player";
import Star from "./objects/star";
import Vector from "./util/Vector";
import {camera, cameraZoom, updateCamera, getCameraVisibilities} from "./camera";

let scenes: Array<Scene> = []

enum Level {
    PLANET,
    SOLAR_SYSTEM,
    GALAXY,
    UNIVERSE
}

let player: Player = null

class Scene {
    gameObjects: Array<GameObject> = []
    constructor(private level: Level) {
        for (let i = 0; i < 10000; i++) {
            this.gameObjects.push(new Star())
        }
        this.gameObjects.push(player = new Player())
    }

    update(dt: number, time: number) {
        for (const go of this.gameObjects) {
            go.update(dt, time)
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        const visibilities = getCameraVisibilities(this.gameObjects)
        const objectCount = this.gameObjects.length
        for (let i = 0; i < objectCount; i++) {
            if (visibilities[i]) {
                this.gameObjects[i].draw(context)
            }
        }
    }
}

let time = 0
let paused = false

listenKeyDown(function (k) {
    if (k === key.p) {
        paused = !paused
    }
})

function update(dt: number) {
    if (paused) {
        return
    }

    if (scenes.length === 0) {
        scenes.push(new Scene(Level.PLANET))
    }

    time += dt

    for (const scene of scenes) {
        scene.update(dt, time)
    }

    let cameraTarget = player.position.clone()
    cameraTarget.add((new Vector(50, 0).rotateTo(player.angle)))
    cameraTarget.add(player.speed.clone().multiplyScalar(1.5))

    updateCamera(dt, cameraTarget)
}

function draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.save()

    context.translate(canvas.width / 2, canvas.height / 2)
    context.scale(cameraZoom, cameraZoom)
    // context.translate(-canvas.width / 2 / cameraZoom, -canvas.height / 2 / cameraZoom)

    // context.translate((-camera.x + canvas.width / 2 / cameraZoom) / 1, (-camera.y + canvas.height / 2 / cameraZoom) / 1)
    context.translate((-camera.x ) / 1, (-camera.y) / 1)

    for (const scene of scenes) {
        scene.draw(context, canvas)
    }

    context.restore()

    if (paused) {
        context.fillStyle = 'white'
        context.font = '30px Arial'
        context.textAlign = 'center'
        context.fillText('PAUSED', canvas.width / 2, 30, canvas.width)
    }
}

eventDispatcher.listen(GameEvent.UPDATE, update, -1000)
eventDispatcher.listen(GameEvent.DRAW, draw)
