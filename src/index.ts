import {eventDispatcher, GameEvent} from "./eventDispatcher";
import './mainLoop'
import './scene'

window.onload = function() {
    eventDispatcher.dispatch(GameEvent.LOADED)
}
