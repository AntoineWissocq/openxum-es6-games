"use strict";

class Piece {
    constructor(co, c, l) {
        this._color = c;
        this._level = l;
        this._coordinates = co;
        this._stack=[];
        this._stack.push(this._color);
    }

    set_coordinates(c) {
        this._coordinates = c;
    }

//Modification pour récupérer la dernière couleur (celle du haut de la pile)
    color() {
        return this._color; //_stack[this._stack.length-1];
    }

    getLevel() {
        return this._level;
    }

    coordinates() {
        return this._coordinates;
    }

    last_color_piece(){
        return this._stack[this._stack.length-1];
    }

    equals(p) {
        if (p !== undefined)
            return !(p.coordinates().x() !== this._coordinates.x() || p.coordinates().y() !== this._coordinates.y() || p.getLevel() !== this._level || p.color() !== this._color);

        return false;
    }

    clone() {
        return new Piece(this._color, this._level, this._coordinates);
    }
}

export default Piece;