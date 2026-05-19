/**
 * Allows the predefined functions to provide a custom generator function. May remove.
 */
export const generatorRegistry = {
    _pending: null,

    register(fn) {
        this._pending = fn;
    },

    consume(type, essenceGenerator) {
        if (this._pending) {
            this._pending(type, essenceGenerator);
            this._pending = null; // consume it
            return true; // custom generator used
        }

        return false; // no custom generator was used
    }
}