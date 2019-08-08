import {eventDispatcher, GameEvent} from "./util/eventDispatcher";
import GameObject from "./objects/gameObject";
import {listenKeyDown, key} from "./util/input";
import Player from "./objects/player";
import Star from "./objects/star";

let scenes = []

enum Level {
    PLANET,
    SOLAR_SYSTEM,
    GALAXY,
    UNIVERSE
}

class Scene {
    gameObjects: Array<GameObject> = []
    constructor(private level: Level) {
        for (let i = 0; i < 100; i++) {
            this.gameObjects.push(new Star())
        }
        this.gameObjects.push(new Player())
    }

    update(dt: number, time: number) {
        for (const go of this.gameObjects) {
            go.update(dt, time)
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        for (const go of this.gameObjects) {
            go.draw(context)
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

eventDispatcher.listen(GameEvent.UPDATE, function (dt: number) {
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
}, -1000)

eventDispatcher.listen(GameEvent.DRAW, function (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (const scene of scenes) {
        scene.draw(context, canvas)
    }

    if (paused) {
        context.fillStyle = 'white'
        context.font = '30px Arial'
        context.textAlign = 'center'
        context.fillText('PAUSED', canvas.width / 2, 30, canvas.width)
    }
})
