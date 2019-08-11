import Vector from "./util/Vector";
import GameObject from "./objects/gameObject";
import {canvas} from "./scene";

let visibilityArray: Array<boolean> = []

export default class Camera {
    camera: Vector = new Vector(0, 0)
    cameraZoom: number = 0.8
    cameraZoomTarget = 1
    constructor() {

    }

    getStarZoom() {
        // return (cameraZoom + 1) / 2
        // return cameraZoom * 0.7
        return (this.cameraZoom * 0.8 + 1) / 2
    }

    setCameraZoomTarget(targetZoom) {
        this.cameraZoomTarget = targetZoom
    }

    updateCamera(dt: number, target: Vector, middleMode = false) {
        let cameraDelta = target.subtract(this.camera).multiplyScalar(middleMode ? 0.5 : dt)
        this.camera.add(cameraDelta)

        this.cameraZoom += (this.cameraZoomTarget - this.cameraZoom) * dt * 0.3
    }

    getCameraBounds() {
        return {
            left: this.camera.x - canvas.width * 0.5 / this.cameraZoom,
            right: this.camera.x + canvas.width * 0.5 / this.cameraZoom,
            top: this.camera.y - canvas.height * 0.5 / this.cameraZoom,
            bottom: this.camera.y + canvas.height * 0.5 / this.cameraZoom,
        }
    }

    getStarCameraBounds() {
        let starZoom = this.getStarZoom()
        return {
            left: this.camera.x - canvas.width * 0.5 / starZoom,
            right: this.camera.x + canvas.width * 0.5 / starZoom,
            top: this.camera.y - canvas.height * 0.5 / starZoom,
            bottom: this.camera.y + canvas.height * 0.5 / starZoom,
        }
    }

    getCameraVisibilities(gameObjects: Array<GameObject>, forStars: boolean = false) {
        const {
            left, right, top, bottom
        } = forStars ? this.getStarCameraBounds() : this.getCameraBounds()

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

}
