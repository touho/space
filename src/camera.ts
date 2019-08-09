import Vector from "./util/Vector";
import GameObject from "./objects/gameObject";
import {canvas} from "./scene";

export let camera: Vector = new Vector(0, 0)
export let cameraZoom: number = 0.3
export let cameraZoomTarget = 1

let visibilityArray: Array<boolean> = []

export function getStarZoom() {
    // return (cameraZoom + 1) / 2
    // return cameraZoom * 0.7
    return (cameraZoom * 0.8 + 1) / 2
}

export function setCameraZoomTarget(targetZoom) {
    cameraZoomTarget = targetZoom
}

export function updateCamera(dt: number, target: Vector) {
    let cameraDelta = target.subtract(camera).multiplyScalar(1 * dt)
    camera.add(cameraDelta)

    cameraZoom += (cameraZoomTarget - cameraZoom) * dt * 0.3
}

export function getCameraBounds() {
    return {
        left: camera.x - canvas.width * 0.5 / cameraZoom,
        right: camera.x + canvas.width * 0.5 / cameraZoom,
        top: camera.y - canvas.height * 0.5 / cameraZoom,
        bottom: camera.y + canvas.height * 0.5 / cameraZoom,
    }
}

export function getStarCameraBounds() {
    let starZoom = getStarZoom()
    return {
        left: camera.x - canvas.width * 0.5 / starZoom,
        right: camera.x + canvas.width * 0.5 / starZoom,
        top: camera.y - canvas.height * 0.5 / starZoom,
        bottom: camera.y + canvas.height * 0.5 / starZoom,
    }
}

export function getCameraVisibilities(gameObjects: Array<GameObject>, forStars: boolean = false) {
    const {
        left, right, top, bottom
    } = forStars ? getStarCameraBounds() : getCameraBounds()

    const objectCount = gameObjects.length

    visibilityArray.length = objectCount

    for (let i = 0; i < objectCount; i++) {
        let { position, maximumRadius } = gameObjects[i]

        visibilityArray[i] =
            position.x + maximumRadius >= left
            && position.x - maximumRadius <= right
            && position.y + maximumRadius >= top
            && position.y - maximumRadius <= bottom
    }
    return visibilityArray
}
