import {eventDispatcher, GameEvent} from "./util/eventDispatcher";
import GameObject from "./objects/gameObject";
import {key, listenKeyDown} from "./util/input";
import Player from "./objects/player";
import Star from "./objects/star";
import Vector from "./util/Vector";
import Camera from "./camera";
import Planet from "./objects/planet";
import {Level} from "./gameContext";

export let canvas : HTMLCanvasElement;
let context : CanvasRenderingContext2D;

eventDispatcher.listen(GameEvent.LOADED, function () {
    canvas = document.getElementById('canvas') as HTMLCanvasElement
    context = canvas.getContext('2d')
}, 0)

let scenes: Array<Scene> = []

// let player: Player = null
// let planet: Planet = null

class Scene {
    camera = new Camera()
    gameObjects: Array<GameObject> = []
    stars: Array<GameObject> = []

    // Radius of this scene. You start to move to outer scale at innerRadius and at outerRadius this scene can be removed
    innerRadius: number = 1000
    outerRadius: number = 2000

    player: Player = null
    planet: Planet = null
    initialPlanet: Planet = null

    constructor(public level: Level) {
        for (let i = 0; i < 10000; i++) {
            this.stars.push(new Star(level))
        }
        if (level === Level.PLANET) {
            this.gameObjects.push(this.planet = new Planet(level))
            this.gameObjects.push(this.player = new Player(level))
            this.player.position.setScalars(this.planet.radius + 22, 0)
            this.planet.innerLevelRadius = this.innerRadius
            this.planet.outerLevelRadius = this.outerRadius
        } else if (level === Level.SOLAR_SYSTEM) {
            this.gameObjects.push(this.planet = new Planet(level))
            this.planet.setSun()

            for (let i = 0; i < 10; i++) {
                this.gameObjects.push(new Planet(level))
            }

            this.gameObjects.push(this.player = new Player(level))
            this.player.position.x += 1000

            this.innerRadius = 3000
            this.outerRadius = 4000
        }
        this.initialPlanet = this.planet
    }

    getDistanceToClosest() {
        if (this.level === Level.PLANET) {
            return this.player.position.distance(this.planet.position) - this.planet.radius * 0.7
        } else if (this.level === Level.SOLAR_SYSTEM) {
            let distance = 999999
            for (const go of this.gameObjects) {
                if (go instanceof Planet) {
                    let planet = go as Planet
                    let distanceSuggestion = this.player.position.distance(planet.position) - planet.radius * 0.7
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
                this.camera.setCameraZoomTarget(1)
            } else {
                let targetZoom = Math.max(0.5, Math.min(1, (1 / playerPlanetDist * 200 + 1) / 2))
                this.camera.setCameraZoomTarget(targetZoom)
            }
        } else if (this.level === Level.SOLAR_SYSTEM) {
            if (playerPlanetDist < 0) {
                this.camera.setCameraZoomTarget(1)
            } else {
                let targetZoom = Math.max(0.1, Math.min(1.5, (1 / playerPlanetDist * 350 + 0.3) / 2))
                this.camera.setCameraZoomTarget(targetZoom)
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

                    let distance = planet.position.clone().subtract(this.player.position)
                    let gravity = distance.setLength(10000 / distance.length() / distance.length())
                    gravity.multiplyScalar(planet.radius)

                    gravity.setLength(Math.min(gravity.length(), 25))

                    this.player.speed.add(gravity.multiplyScalar(dt))
                }
            }
        }

        let cameraTarget = this.player.position.clone()
        this.camera.updateCamera(dt, cameraTarget, middleMode)
    }

    drawStars(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, alpha = 1) {
        if (alpha < 0) return
        context.globalAlpha = alpha
        const visibilities = this.camera.getCameraVisibilities(this.stars, true)
        const starCount = this.stars.length

        for (let i = 0; i < starCount; i++) {
            if (visibilities[i]) {
                this.stars[i].draw(context)
            }
        }
    }

    draw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, alpha = 1) {
        if (alpha < 0) return

        context.globalAlpha = alpha

        context.strokeStyle = 'blue'
        context.lineWidth = 1

        context.beginPath()
        context.arc(0, 0, this.innerRadius, 0, Math.PI * 2, false)
        context.stroke()

        context.strokeStyle = 'purple'

        context.beginPath()
        context.arc(0, 0, this.outerRadius, 0, Math.PI * 2, false)
        context.stroke()

        const visibilities = this.camera.getCameraVisibilities(this.gameObjects)
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (visibilities[i]) {
                this.gameObjects[i].draw(context)
            }
        }
    }
}

export let time = 0
let paused = false
let middleMode = false

listenKeyDown(function (k) {
    if (k === key.p) {
        paused = !paused
    }
})

function getTransformPosition(player: Player, initialPlanet: Planet) {
    let relativePos = player.position.clone().subtract(initialPlanet.position)
    let distanceFromCenter = relativePos.length()
    let transformPositionLength = 1 + (distanceFromCenter - initialPlanet.innerLevelRadius) / (initialPlanet.outerLevelRadius - initialPlanet.innerLevelRadius)
    return relativePos.setLength(transformPositionLength)
}

function setPlayerToTransformPosition(player: Player, initialPlanet: Planet, transformPosition: Vector) {
    let transformPosLen = transformPosition.length()
    transformPosLen -= 1

    let len = transformPosLen * (initialPlanet.outerLevelRadius - initialPlanet.innerLevelRadius) + initialPlanet.innerLevelRadius

    let pos = transformPosition.clone().setLength(len)
    pos.add(initialPlanet.position)
    player.position.set(pos)
}

function update(dt: number) {
    if (paused) {
        return
    }

    time += dt

    if (scenes.length === 0) {
        scenes.push(new Scene(Level.PLANET))
    } else if (scenes[0].level === Level.PLANET && scenes[0].player.position.length() >= scenes[0].innerRadius && !middleMode) {
        middleMode = true
        let oldPlayer = scenes[0].player
        scenes.push(new Scene(Level.SOLAR_SYSTEM))
        let newScene = scenes[scenes.length-1]
        let objs = newScene.gameObjects
        newScene.initialPlanet = objs.find(go => {
            return go instanceof Planet && !go.position.isZero()
        }) as Planet

        let tp = getTransformPosition(scenes[0].player, scenes[0].initialPlanet)
        setPlayerToTransformPosition(scenes[1].player, scenes[1].initialPlanet, tp)

        // tp = getTransformPosition(scenes[1].player, scenes[1].initialPlanet)

        // scenes[1].player.position.set(newScene.initialPlanet.position)
        scenes[1].player.angle = oldPlayer.angle
        scenes[1].player.speed.set(oldPlayer.speed)

        scenes[1].camera.cameraZoom = scenes[0].camera.cameraZoom
        scenes[1].camera.camera.set(scenes[1].player.position)
    } else if (scenes[0].player.position.length() >= scenes[0].outerRadius) {
        let playerPos = scenes[0].player.position.multiplyScalar(0.6)
        scenes.splice(0, 1)
        middleMode = false
        if (scenes.length === 0) {
            scenes.push(new Scene(Level.SOLAR_SYSTEM))
            scenes[0].player.position.set(playerPos)
        }
    } else if (middleMode && scenes[0].player.position.length() < scenes[0].innerRadius) {
        scenes.splice(1, 1)
        middleMode = false
    } else if (scenes.length === 1 && scenes[0].level === Level.SOLAR_SYSTEM) {
        let scene = scenes[0]
        for (let go of scene.gameObjects) {
            if (go instanceof Planet) {
                let planet = go as Planet
                if (!planet.position.isZero() && scene.player.position.distance(planet.position) < planet.outerLevelRadius) {
                    scene.initialPlanet = planet
                    middleMode = true
                    let oldPlayer = scenes[0].player
                    scenes.push(new Scene(Level.PLANET))
                    let newScene = scenes[scenes.length-1]
                    let objs = newScene.gameObjects

                    let tp = getTransformPosition(scenes[0].player, scenes[0].initialPlanet)
                    console.log('tp', tp, scenes[0].player.position, scenes[0].initialPlanet.position)
                    setPlayerToTransformPosition(scenes[1].player, scenes[1].initialPlanet, tp)

                    tp = getTransformPosition(scenes[1].player, scenes[1].initialPlanet)
                    console.log('tp', tp, scenes[1].player.position, scenes[1].initialPlanet.position)

                    // scenes[1].player.position.set(newScene.initialPlanet.position)
                    scenes[1].player.angle = oldPlayer.angle
                    scenes[1].player.speed.set(oldPlayer.speed)

                    scenes[1].camera.cameraZoom = scenes[0].camera.cameraZoom
                    scenes[1].camera.camera.set(scenes[1].player.position)

                    scenes.reverse()
                }
            }
        }
    }

    for (const scene of scenes) {
        scene.update(dt, time)
        scene.updateZoom()
    }

    if (scenes.length === 2) {
        let transformPosition: Vector = new Vector(0, 0)

        for (const scene of scenes) {
            let tp = getTransformPosition(scene.player, scene.initialPlanet)
            // if (scene === scenes[0]) {
            //     tp.multiplyScalar(2 - tp.length())
            // } else {
            //     tp.multiplyScalar(tp.length())
            // }
            transformPosition.add(tp)
        }
        transformPosition.divideScalar(scenes.length)
        // console.log('trans', transformPosition)
        for (const scene of scenes) {
            setPlayerToTransformPosition(scene.player, scene.initialPlanet, transformPosition)
        }

        scenes[1].camera.cameraZoom = scenes[0].camera.cameraZoom

        // unify player position
    }

    // let cameraTarget = player.position.clone()
    // cameraTarget.add((new Vector(50, 0).rotateTo(player.angle)))
    // cameraTarget.add(player.speed.clone().multiplyScalar(1.5))


    draw()
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height)


    // Draw stars

    for (let scene of scenes) {
        context.save()

        context.translate(canvas.width / 2, canvas.height / 2)
        let starZoom = scene.camera.getStarZoom()
        context.scale(starZoom, starZoom)
        context.translate((-scene.camera.camera.x ) / 1, (-scene.camera.camera.y) / 1)

        let alpha = 1
        if (middleMode) {
            let tp = getTransformPosition(scene.player, scene.initialPlanet)
            if (scene === scenes[0]) {
                alpha = 1 - (tp.length() - 1)
            } else {
                alpha = tp.length() - 1
            }
        }
        scene.drawStars(context, canvas, alpha)

        context.restore()
    }


    // Draw others

    for (let scene of scenes) {
        context.save()

        context.translate(canvas.width / 2, canvas.height / 2)
        context.scale(scene.camera.cameraZoom, scene.camera.cameraZoom)
        context.translate((-scene.camera.camera.x) / 1, (-scene.camera.camera.y) / 1)

        let alpha = 1
        if (middleMode) {
            let tp = getTransformPosition(scene.player, scene.initialPlanet)
            if (scene === scenes[0]) {
                alpha = 1 - (tp.length() - 1)
            } else {
                alpha = tp.length() - 1
            }
        }
        scene.draw(context, canvas, alpha)

        context.restore()
    }

    if (paused) {
        context.fillStyle = 'white'
        context.font = '30px Arial'
        context.textAlign = 'center'
        context.fillText('PAUSED', canvas.width / 2, 30, canvas.width)
    }
}

eventDispatcher.listen(GameEvent.UPDATE, update, -1000)
