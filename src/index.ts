import {eventDispatcher, GameEvent} from "./util/eventDispatcher";
import './mainLoop'
import './scene'

window.onload = function() {
    eventDispatcher.dispatch(GameEvent.LOADED)
}
