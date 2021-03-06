"use strict";

import Color from './color.mjs';
import Coordinates from './coordinates.mjs';
import MoveType from './move_type.mjs';

class Move {
    constructor(t, c, c1, c2, stack, level) {
        this._type = t;
        this._color = c;
        this._stack = stack;
        this._level = level;
        if (this._type === MoveType.PUT_PIECE) {
            this._coordinates = c1;
        }
        else if (this._type === MoveType.MOVE_PIECE) {
            this._from = c1;
            this._to = c2;
        }
    }

// public methods
    color() {
        return this._color;
    }

    stack() {
        return this._stack;
    }

    level() {
        return this._level;
    }

    coordinates() {
        return this._coordinates;
    }

    from() {
        return this._from;
    }

    to() {
        return this._to;
    }

    get() {
        if (this._type === MoveType.PUT_PIECE) {
            return 'put ';
        } else if (this._type === MoveType.MOVE_PIECE) {
            return 'move ';
            //return 'push ' + (this._color === Color.BLACK ? "black" : "white") + ' piece from ' + this._from.to_string() + ' to ' + this._to.to_string();
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
        else if (type === 'pp') {
            this._type = MoveType.PUSH_PIECE;
        }

        this._color = str.charAt(2) === 'B' ? Color.BLACK : Color.WHITE;
        if (this._type === MoveType.PUT_PIECE) {
            this._coordinates = new Coordinates(str.charAt(3), parseInt(str.charAt(4)));
        }

        if (this._type === MoveType.MOVE_PIECE) {
            this._from = new Coordinates(str.charAt(3), parseInt(str.charAt(4)));
            this._to = new Coordinates(str.charAt(5), parseInt(str.charAt(6)));
        }
    }

    to_object() {
        return { type: this._type, color: this._color, coordinates: this._coordinates, from: this._from, to: this._to };
    }

    to_string() {
        if (this._type === MoveType.PUT_PIECE) {
            return 'put ' + (this._color === Color.BLACK ? 'black' : 'white') + ' piece at ' + this._coordinates.to_string();
        }
        else if (this._type === MoveType.MOVE_PIECE) {

            //return 'push ' + (this._color === Color.BLACK ? "black" : "white") + ' piece from ' + this._from.to_string() + ' to ' + this._to.to_string();
        }
    }

    type() {
        return this._type;
    }
}

export default Move;