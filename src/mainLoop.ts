import {eventDispatcher, GameEvent} from "./util/eventDispatcher";

eventDispatcher.listen(GameEvent.LOADED, function () {
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

    window.requestAnimationFrame(loop)
}
