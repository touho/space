import {eventDispatcher, GameEvent} from "./eventDispatcher";
import './mainLoop'

let canvas : HTMLCanvasElement;
let context : CanvasRenderingContext2D;

function updateCanvasSize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
window.onresize = updateCanvasSize

eventDispatcher.listen(GameEvent.LOADED, function () {
    canvas = document.getElementById('canvas') as HTMLCanvasElement
    updateCanvasSize()
    context = canvas.getContext('2d')

    previousT = performance.now() * 0.001
    loop()
}, 10)

let previousT

function loop() {
    let t = performance.now() * 0.001;
    let dt = t - previousT;

    if (dt > 0.05)
        dt = 0.05;

    eventDispatcher.dispatch(GameEvent.UPDATE, dt)
    eventDispatcher.dispatch(GameEvent.DRAW, context, canvas)

    window.requestAnimationFrame(loop)
}
