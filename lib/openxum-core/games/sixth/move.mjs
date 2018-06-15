"use strict";

import Color from './color.mjs';
import Coordinates from './coordinates.mjs';
import MoveType from './move_type.mjs';

class Move {
    constructor(t, c, c1, c2) {
        this._type = t;
        this._color = c;
        if (this._type === MoveType.PUT_PIECE) {
            this._coordinates = c1;
        }
    }

// public methods
    color() {
        return this._color;
    }

    coordinates() {
        return this._coordinates;
    }

    from() {
        return this._from;
    }

    get() {
        if (this._type === MoveType.PUT_PIECE) {
            return 'Pp' + (this._color === Color.BLACK ? "B" : "W");// + this._coordinates.to_string();
        }
    }

    list() {
        return this._list;
    }

    parse(str) {
        let type = str.substring(0, 2);

        if (type === 'Pp') {
            this._type = MoveType.PUT_PIECE;
        }
        this._color = str.charAt(2) === 'B' ? Color.BLACK : Color.WHITE;
        if (this._type === MoveType.PUT_FIRST_PIECE || this._type === MoveType.PUT_PIECE) {
            this._coordinates = new Coordinates(str.charAt(3), parseInt(str.charAt(4)));
        }
    }

    to() {
        return this._to;
    }

    to_object() {
        return { type: this._type, color: this._color, coordinates: this._coordinates, from: this._from, to: this._to };
    }

    to_string() {
        if (this._type === MoveType.PUT_PIECE) {
            return 'put ' + (this._color === Color.BLACK ? 'black' : 'white') + ' piece at ' + this._coordinates.to_string();
        }
    }

    type() {
        return this._type;
    }
}

export default Move;

















/*
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
    */