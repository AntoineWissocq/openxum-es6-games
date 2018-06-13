"use strict";

import Color from './color.mjs';
import Coordinates from './coordinates.mjs';
import Piece from './piece.mjs';

class Move {
    constructor(f, t) {
        this._from= f;
        this._to = t;
        this._pose = true;
    }

    // public methods



    from() {
        return this._from;
    }

    to() {
        return this._to;
    }


    get() {
        if (this._pose) {
            return String.fromCharCode('a'.charCodeAt(0) + this._to.x) + (this._to.y + 1);
        } else {
            return String.fromCharCode('a'.charCodeAt(0) + this._from.x) + (this._from.y + 1) +
                String.fromCharCode('a'.charCodeAt(0) + this._to.x) + (this._to.y + 1);

        }
    }

    parse(str) {
        if(str.length==2)
        {
            this._to = { x: str.charCodeAt(2) - 'a'.charCodeAt(0), y: str.charCodeAt(3) - '1'.charCodeAt(0) };
        }else{
            this._from = {x: str.charCodeAt(0) - 'a'.charCodeAt(0), y: str.charCodeAt(1) - '1'.charCodeAt(0)};
            this._to = {x: str.charCodeAt(2) - 'a'.charCodeAt(0), y: str.charCodeAt(3) - '1'.charCodeAt(0)};
        }
    }


    to_string() {
        return 'move' + ((this._piece.color() === Color.WHITE) ? " white pawn" : " black pawn") + " from " + this._piece.coordinates().to_string() + " to " + this._to.to_string();
    }
}

export default Move;