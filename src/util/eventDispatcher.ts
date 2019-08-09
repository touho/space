export enum GameEvent {
    LOADED = 'LOADED',
    UPDATE = 'UPDATE'
}

export type ListenerFunction = Function & { priority?: number };

export default class EventDispatcher {
    _listeners: { [event in GameEvent]?: Array<ListenerFunction> } = {};

    // priority should be a whole number between -100000 and 100000. a smaller priority number means that it will be executed first.
    listen(event: GameEvent, callback: ListenerFunction, priority = 0) {
        (callback as any).priority = priority + (listenerCounter++ / NUMBER_BIGGER_THAN_LISTENER_COUNT);
        if (!this._listeners.hasOwnProperty(event)) {
            this._listeners[event] = [];
        }
        let index = decideIndexOfListener(this._listeners[event], callback);
        this._listeners[event].splice(index, 0, callback);
        return () => {
            let eventListeners = this._listeners[event];
            if (!eventListeners) return; // listeners probably already deleted

            let index = eventListeners.indexOf(callback);
            if (index >= 0)
                eventListeners.splice(index, 1);
        };
    }
    dispatch(event: GameEvent, ...parameters) {
        let listeners = this._listeners[event];
        if (!listeners)
            return;
        for (let i = 0; i < listeners.length; i++) {
            try {
                listeners[i](...parameters);
            } catch (e) {
                console.error(`Event ${event} listener crashed.`, this._listeners[event][i], e);
            }
        }
    }
}

export let eventDispatcher = new EventDispatcher();

let listenerCounter = 0;
const NUMBER_BIGGER_THAN_LISTENER_COUNT = 10000000000;

function decideIndexOfListener(array, callback) {
    let low = 0,
        high = array.length,
        priority = callback.priority;

    while (low < high) {
        let mid = low + high >>> 1;
        if (array[mid].priority < priority) low = mid + 1;
        else high = mid;
    }
    return low;
}
