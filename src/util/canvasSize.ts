import {eventDispatcher, GameEvent} from "./eventDispatcher";

let canvas: HTMLCanvasElement = null

let previousWidth = 0, previousHeight = 0

function setSize(force: boolean = false) {
    console.log('resize')
    if (!canvas) return
    console.log('resize')
    let width = window.innerWidth
    let height = window.innerHeight

    if (width === previousWidth && height === previousHeight)
        return

    console.log('resize')

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    canvas.width = width
    canvas.height = height

    window.scrollTo(0, 0);

    previousWidth = width;
    previousHeight = height;

    // Lets see if it has changed after 200ms.
    setTimeout(() => setSize(), 200);
}
window.onresize = setSize

eventDispatcher.listen(GameEvent.LOADED, function () {
    canvas = document.getElementById('canvas') as HTMLCanvasElement
    setSize()
}, 1)
