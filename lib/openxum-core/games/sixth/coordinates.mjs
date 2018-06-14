"use strict";


const letters = ['A', 'B', 'C', 'D', 'E'];

class Coordinates {
    constructor(l, n) {
        this._letter = l;
        this._number = n;
    }

    // public methods

    hash() {
        return (this._letter.charCodeAt(0) - 'A'.charCodeAt(0)) + (this._number - 1) * 9;
    }

    is_valid() {
        return (this._letter === 'A' && this._number >= 1 && this._number <= 5) ||
            (this._letter === 'B' && this._number >= 1 && this._number <= 6) ||
            (this._letter === 'C' && this._number >= 1 && this._number <= 7) ||
            (this._letter === 'D' && this._number >= 1 && this._number <= 8) ||
            (this._letter === 'E' && this._number >= 1 && this._number <= 9);
    }

    letter() {
        return this._letter;
    }

    number() {
        return this._number;
    }

    to_string() {
        return this._letter + this._number;
    }

}

export default Coordinates;