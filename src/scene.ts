import {eventDispatcher, GameEvent} from "./util/eventDispatcher";
import GameObject from "./objects/gameObject";
import {listenKeyDown, key} from "./util/input";
import Player from "./objects/player";
import Star from "./objects/star";
import Vector from "./util/Vector";
import {
    camera,
    cameraZoom,
    updateCamera,
    getCameraVisibilities,
    cameraZoomTarget,
    setCameraZoomTarget,
    getStarZoom
} from "./camera";
import Planet from "./objects/planet";
import {Level} from "./gameContext";

let scenes: Array<Scene> = []

let player: Player = null
let planet: Planet = null

class Scene {
    gameObjects: Array<GameObject> = []
    stars: Array<GameObject> = []

    // Radius of this scene. You start to move to outer scale at innerRadius and at outerRadius this scene can be removed
    innerRadius: number = 1000
    outerRadius: number = 2000

    constructor(private level: Level) {
        for (let i = 0; i < 10000; i++) {
            this.stars.push(new Star(level))
        }
        if (level === Level.PLANET) {
            this.gameObjects.push(planet = new Planet(level))
            this.gameObjects.push(player = new Player(level))
            player.position.setScalars(planet.radius + 22, 0)
        } else if (level === Level.SOLAR_SYSTEM) {
            this.gameObjects.push(planet = new Planet(level))
            planet.setSun()

            for (let i = 0; i < 10; i++) {
                this.gameObjects.push(new Planet(level))
            }

            this.gameObjects.push(player = new Player(level))
            player.position.x += 1000

            this.innerRadius = 3000
            this.outerRadius = 4000
        }
    }

    getDistanceToClosest() {
        if (this.level === Level.PLANET) {
            return player.position.distance(planet.position) - planet.radius * 0.7
        } else if (this.level === Level.SOLAR_SYSTEM) {
            let distance = 999999
            for (const go of this.gameObjects) {
                if (go instanceof Planet) {
                    let planet = go as Planet
                    let distanceSuggestion = player.position.distance(planet.position) - planet.radius * 0.7
                    if (distanceSuggestion < distance) {
                        distance = distanceSuggestion
                    }
                }
            }
            return distance
        }
    }

    updateZoom() {
        let playerPlanetDist = this.getDistanceToClosest()
        if (this.level === Level.PLANET) {
            if (playerPlanetDist < 0) {
                setCameraZoomTarget(1)
            } else {
                let targetZoom = Math.max(0.5, Math.min(1, (1 / playerPlanetDist * 200 + 1) / 2))
                setCameraZoomTarget(targetZoom)
            }
        } else if (this.level === Level.SOLAR_SYSTEM) {
            if (playerPlanetDist < 0) {
                setCameraZoomTarget(1)
            } else {
                let targetZoom = Math.max(0.1, Math.min(1.5, (1 / playerPlanetDist * 350 + 0.3) / 2))
                setCameraZoomTarget(targetZoom)
            }
        }
    }

    update(dt: number, time: number) {
        for (const go of this.gameObjects) {
            go.update(dt, time)
        }

        if (this.level === Level.SOLAR_SYSTEM) {
            for (const go of this.gameObjects) {
                if (go instanceof Planet) {
                    let planet = go as Planet

                    let distance = planet.position.clone().subtract(player.position)
                    let gravity = distance.setLength(10000 / distance.length() / distance.length())
                    gravity.multiplyScalar(planet.radius)

                    gravity.setLength(Math.min(gravity.length(), 25))

                    player.speed.add(gravity.multiplyScalar(dt))
                }
            }
        }
    }

    drawStars(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        const visibilities = getCameraVisibilities(this.stars, true)
        const starCount = this.stars.length

        for (let i = 0; i < starCount; i++) {
            if (visibilities[i]) {
                this.stars[i].draw(context)
            }
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        context.strokeStyle = 'blue'
        context.lineWidth = 1

        context.beginPath()
        context.arc(0, 0, this.innerRadius, 0, Math.PI * 2, false)
        context.stroke()

        context.strokeStyle = 'purple'

        context.beginPath()
        context.arc(0, 0, this.outerRadius, 0, Math.PI * 2, false)
        context.stroke()

        const visibilities = getCameraVisibilities(this.gameObjects)
        for (let i = 0; i < this.gameObjects.length; i++) {
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
    } else if (player.position.length() >= scenes[0].outerRadius) {
        let playerPos = player.position.multiplyScalar(0.6)
        scenes.length = 0
        scenes.push(new Scene(Level.SOLAR_SYSTEM))
        player.position.set(playerPos)
    }

    time += dt

    for (const scene of scenes) {
        scene.update(dt, time)
        scene.updateZoom()
    }

    let cameraTarget = player.position.clone()
    // cameraTarget.add((new Vector(50, 0).rotateTo(player.angle)))
    // cameraTarget.add(player.speed.clone().multiplyScalar(1.5))

    updateCamera(dt, cameraTarget)
}

function draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.clearRect(0, 0, canvas.width, canvas.height)


    // Draw stars

    context.save()
    context.translate(canvas.width / 2, canvas.height / 2)
    let starZoom = getStarZoom()
    context.scale(starZoom, starZoom)
    context.translate((-camera.x ) / 1, (-camera.y) / 1)
    for (const scene of scenes) {
        scene.drawStars(context, canvas)
    }
    context.restore()


    // Draw others

    context.save()

    context.translate(canvas.width / 2, canvas.height / 2)
    context.scale(cameraZoom, cameraZoom)
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
