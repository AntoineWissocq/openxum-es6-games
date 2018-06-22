"use strict";

import Color from './color.mjs';
import Coordinates from './coordinates.mjs';
import GameType from './game_type.mjs';
import Intersection from './intersection.mjs';
import OpenXum from '../../openxum/engine.mjs';
import Move from './move.mjs';
import MoveType from './move_type.mjs';
import Piece from './piece.mjs';
import Sixth from '../../../openxum-browser/games/sixth/index.mjs';
import Phase from './phase.mjs';
import State from './state.mjs';

const begin_letters = ['A', 'B', 'C', 'D', 'E'];
const end_letters = ['A', 'B', 'C', 'D', 'E'];
const begin_numbers = [1, 2, 3, 4, 5];
const end_numbers = [1, 2, 3, 4, 5];

const letters = ['A', 'B', 'C', 'D', 'E'];
const numbers = [1, 2, 3, 4, 5];

class Engine extends OpenXum.Engine {
    constructor(t, c) {
        super();

        this._type = t;
        this._current_color = 0;
        this._current_stack = [0];
        this._current_level = 1;
        this._current_nbpiece = [0];

        this._tabPiece = [];
        this._black_piece = [];
        this._white_piece = [];

        //this._tabPiece[0] = {_letter: this._letter, _number: this._number, _level : this._level};

        this._cases = [];

        this._phase = Phase.PUT_PIECE;

        this._initial_placed_piece_number = 0;

        for (let i = 0; i < letters.length; ++i) {
            for (let j = 0; j < numbers.length; ++j) {

                let letter = this._compute_letter(i, j);
                let number = this._compute_number(i, j);

                let coordinates = new Coordinates(letter, number);

                this._cases[coordinates.hash()] = new Intersection(coordinates);
            }
        }
    }

    // public methods
    apply_moves(moves) {
        //TODO
    }

    _exist_intersection(letter, number) {
        let coordinates = new Coordinates(letter, number);

        if (coordinates.is_valid()) {
            return this._cases[coordinates.hash()] !== null;
        } else {
            return false;
        }
    }

    clone() {
        let o = new Engine(this._type, this._color);

        o.set(this._phase, this._black_towers, this._white_towers, this._play_color);
        return o;
    }

    current_color() {
        return this._current_color;
    }

    current_level(piece) {
        this._current_level = piece._level;
        return this._current_level;
    }

    current_stack(piece) {
        this._current_stack = piece._stack;
        return this._current_stack;
    }

    current_nbpiece(nbre) {
        this._current_nbpiece = nbre;
        return this._current_nbpiece;
    }

    phase() {
        return this._phase;
    }

    get_name() {
        return 'Sixth';
    }

    /*
    get_possible_move_list() {

        let list = [];

        if (this._phase === Phase.PUT_PIECE) {
            const L = this._get_possible_putting_list();

            for (let i = 0; i < L.length; ++i) {
                list.push(new Move(MoveType.PUT_PIECE, this._current_color, L[i], null));
            }
        }

        else if (this._phase === Phase.MOVE_PIECE) {
            const L_put = this._get_possible_putting_list();

            for (let i = 0; i < L_put.length; ++i) {
                const L_push = this._get_possible_moving_list(L_put[i]);

                for (let j = 0; j < L_push.length; ++j) {
                    list.push([
                        new Move(MoveType.MOVE_PIECE, this._current_color, L_put[i], L_push[j])
                    ]);
                }
            }
        }
        return list;
    }
    */

    get_possible_move_list() {
        let list = [];
        let move = [];
        let pieceTemp = [];
        let put = this._get_possible_putting_list();

        for(let i=0; i<this._tabPiece.length; ++i){
            pieceTemp.push(new Piece(this._tabPiece[i]._coordinates, this._tabPiece[i]._color, this._tabPiece[i]._level));
        }

        for(let i=0; i<this._tabPiece.length; ++i){
            pieceTemp[i]._coordinates._letter=this._tabPiece[i]._coordinates._letter;
            pieceTemp[i]._coordinates._number=this._tabPiece[i]._coordinates._number;
            pieceTemp[i]._color=this._tabPiece[i]._color;
            pieceTemp[i]._stack=this._tabPiece[i]._stack;
            pieceTemp[i]._level=this._tabPiece[i]._level;
        }

        for(let i=0; i<put.length; ++i) {
            move.push(new Move(0, this._current_color, put[i], null))
        }

        for(let i= 0; i<this._tabPiece.length; ++i){
            for(let j= 1; j<=this._tabPiece[i]._level; ++j)
            {
                pieceTemp[i]._level = j;
                list=this._get_possible_moving_list_IA(pieceTemp[i]);

                for(let k=0; k<list.length; ++k) {
                    move.push(new Move(1, pieceTemp[i]._color, this._tabPiece[i]._coordinates, list[k], pieceTemp[i]._stack, j));
                }
            }// j
        }// i

        return move;
    }

    get_type() {
        return this._type;
    }

    is_finished() {
        return this._black_piece_number === 0 || this._white_piece_number === 0;
    }

    move(move) {

        if (move.constructor === Array) {
            if (move[0].type() === MoveType.PUT_PIECE) {
                this._put_piece(move[0].coordinates(), this._current_color, 1);
            }
        } else {
            if (move.type() === MoveType.PUT_PIECE) {
                this._put_piece(move.coordinates(), this._current_color, 1);
            }
            else if (move.type() === MoveType.MOVE_PIECE) {
                console.log("nbpiece current :", this._current_nbpiece);
                this._move_piece(move.from(), this._current_stack, this._current_level, this._current_nbpiece, move.to());
            }
        }
        //console.log("tab piece :",JSON.stringify(this._tabPiece));
    }

    set(phase, black_towers, white_towers, play_color) {
        let i = black_towers.length;

        while (i--) {
            this._black_towers[i].x = black_towers[i].x;
            this._black_towers[i].y = black_towers[i].y;
            this._black_towers[i].color = black_towers[i].color;
        }
        i = white_towers.length;
        while (i--) {
            this._white_towers[i].x = white_towers[i].x;
            this._white_towers[i].y = white_towers[i].y;
            this._white_towers[i].color = white_towers[i].color;
        }
        this._phase = phase;
        this._play_color = play_color;
    }

    parse(str) {
        // TODO
    }

    to_string() {
        // TODO
    }

    winner_is() {
        for(let i=0; i<this._tabPiece.length; ++i){
            if(this._tabPiece[i]._level>=6){
                return this._tabPiece[i].last_color_piece();
            }else return -1;
        }

    }

    if_winner(){
        let color = this.winner_is();

        if (color !== -1)
        {
            if(color === 0)
            {
                console.log("le gagnant est : ", color);
            }else if (color === 1)
            {
                console.log("le gagnant est : ", color);
            }
        }
    }

    get_opponent_piece_next_to(piece, direction) {
        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let op_piece = undefined;

        switch (direction) {
            // TOP
            case 0:
                if (y > 0) {
                    op_piece = this._board[x][y - 1];
                }
                break;

            // BOTTOM
            case 1:
                if (y < 10) {
                    op_piece = this._board[x][y + 1];
                }
                break;

            // RIGHT
            case 2:
                if (x < 10) {
                    op_piece = this._board[x + 1][y];
                }
                break;

            // LEFT
            case 3:
                if (x > 0) {
                    op_piece = this._board[x - 1][y];
                }
                break;
        }

        if (op_piece !== undefined && op_piece.color() === piece.color()) {
            op_piece = undefined;
        }

        return op_piece;
    }

    undo_move(move) {
        let pawns_taken = move.get_pawns_taken();

        this._board[move.to().x()][move.to().y()] = undefined;
        this._board[move.from().x()][move.from().y()] = move.piece();

        if (move.piece().isKing()) {
            this._king = move.piece();
        }

        for (let i = 0; i < pawns_taken.length; i++) {
            let piece = pawns_taken[i];
            this._board[piece.coordinates().x()][piece.coordinates().y()] = piece;

            if (piece.color() === Color.WHITE) {
                this._count_white_pawn++;
            }
            else {
                this._count_black_pawn++;
            }
        }

        this._winner_color = Color.NONE;
        this._is_finished = false;

        this._change_color();
    }

    // private methods

    _change_color() {
        this._current_color = (this._current_color === Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    _put_piece(coordinates, color, level) {

        //console.log("color :",this._color);

        let possiblePut = this._get_possible_putting_list();
        let letter = coordinates._letter;
        let number = coordinates._number;

        for (let i = 0; i < possiblePut.length; ++i) {
            if (letter === possiblePut[i]._letter && number === possiblePut[i]._number) {
                let piece = new Piece(coordinates, color, level);
                this._tabPiece.push(piece);

                if (color === 0) {
                    this._black_piece.push(piece);
                } else if (color === 1) {
                    this._black_piece.push(piece);
                }
            }
        }
        this._change_color();
        //console.log("tab piece : ",this._tabPiece);
    }

    _move_piece(corigine, stack, Alevel, nbPiece, cdestination) {

        for (let i = 0; i < this._tabPiece.length; ++i) {
            if (cdestination._letter === this._tabPiece[i]._coordinates._letter && cdestination._number === this._tabPiece[i]._coordinates._number) {

                this._tabPiece[i]._level += nbPiece;

                for (let j = stack.length - nbPiece; j < stack.length; ++j) {
                    this._tabPiece[i]._stack.push(stack[j]);
                }
                break;
            }
        }

        for (let i = 0; i < this._tabPiece.length; ++i) {
            if (corigine._letter === this._tabPiece[i]._coordinates._letter && corigine._number === this._tabPiece[i]._coordinates._number) {
                console.log("Alevel :", Alevel);
                console.log("nbPiece :", nbPiece);

                if(this._tabPiece[i]._stack.length === 0)
                {
                    this._tabPiece.splice(i, 1);
                }

                if (Alevel <= nbPiece) {
                    this._tabPiece.splice(i, 1);
                    break;
                } else {
                    this._tabPiece[i]._level -= nbPiece;
                    for (let j = 0; j < nbPiece; ++j) {
                        this._tabPiece[i]._stack.pop();
                    }
                    break;
                }
            }
        }

        this._change_color();
    }


    _verify_moving(letter, number) {
        let coordinates = new Coordinates(letter, number);
        let list = this._get_possible_putting_list();
        let found = false;

        for (let i = 0; i < list.length; ++i) {
            if (coordinates._letter === list[i]._letter && coordinates._number === list[i]._number) {
                found = false;
            } else {
                found = true;
            }
        }
        return found;
    }

    //is_empty
    _verify_putting(letter, number) {
        let coordinates = new Coordinates(letter, number);
        let list = this._get_possible_putting_list();
        let found = true;

        if (this._is_empty(coordinates)) {
            found = true;
        } else {
            found = false;
        }

        return found;
    }

    _get_possible_putting_list() {
        let list = [];

        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {

                let letter = this._compute_letter(i, j);
                let number = this._compute_number(i, j);

                let coordinates = new Coordinates(letter, number);

                if (this._is_empty(coordinates)) {

                    list.push(new Coordinates(letter, number));
                }
            }
        }
        return list;
    }

    _is_empty(coordinates) {
        let i = 0;

        if (this._tabPiece.length <= 0) {
            return true;
        }

        while (i < this._tabPiece.length) {

            if (this._tabPiece[i]._coordinates._letter === coordinates._letter && this._tabPiece[i]._coordinates._number === coordinates._number) {
                return false;

            } else {
                ++i;
            }
        }

        return true;
    }

    _get_possible_moving_list(piece) {

        //console.log("piece letter :", piece._coordinates._letter);

        let list = [];

        let xcalc = this._inverse_letter(piece._letter);

        let xnorm = String.fromCharCode(piece._letter.charCodeAt(0));
        let xplus = String.fromCharCode(piece._letter.charCodeAt(0) + 1);
        let xmoins = String.fromCharCode(piece._letter.charCodeAt(0) - 1);

        let y = piece._number;
        let x = piece._letter;

        //////Pion//////
        if (piece._level === 1) {
            //check x
            if (xcalc + 1 <= 5 && (this._is_empty({_letter: xplus, _number: y}) === false)) {
                list.push(new Coordinates(xplus, y));
            }
            if (xcalc - 1 >= 0 && (!this._is_empty({_letter: xmoins, _number: y}))) {
                list.push(new Coordinates(xmoins, y));
            }

            //check y
            if (y + 1 <= 5 && (!this._is_empty({_letter: xnorm, _number: y + 1}))) {
                list.push(new Coordinates(xnorm, y + 1));
            }
            if (y - 1 >= 0 && (!this._is_empty({_letter: xnorm, _number: y - 1}))) {
                list.push(new Coordinates(xnorm, y - 1));
            }
        }//end if == 1

        //////Tour (Orthogonal)//////
        if (piece._level === 2) {

            for (let i = xcalc + 1; i < 5; ++i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);

            }

            for (let i = xcalc - 1; i >= 0; --i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);
            }

            //check y
            for (let i = y + 1; i <= 5; ++i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }
            }

            for (let i = y - 1; i >= 0; --i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }

            }

        }//end if == 2


        //////Cavalier (Déplacement en L)//////
        if (piece._level === 3) {

            //check x droit
            let xplusd = String.fromCharCode(piece._letter.charCodeAt(0) + 2);
            let xmoinsd = String.fromCharCode(piece._letter.charCodeAt(0) - 2);

            if (xcalc + 2 <= 5 && y + 1 <= 5 && (!this._is_empty({_letter: xplusd, _number: y + 1}))) {

                list.push(new Coordinates(xplusd, y + 1));
            }
            if (xcalc + 2 <= 5 && y - 1 >= 0 && (!this._is_empty({_letter: xplusd, _number: y - 1}))) {
                list.push(new Coordinates(xplusd, y - 1));
            }


            //check x gauche
            if (xcalc - 2 >= 0 && y + 1 <= 5 && (!this._is_empty({_letter: xmoinsd, _number: y + 1}))) {
                list.push(new Coordinates(xmoinsd, y + 1));
            }
            if (xcalc - 2 >= 0 && y - 1 >= 0 && (!this._is_empty({_letter: xmoinsd, _number: y - 1}))) {
                list.push(new Coordinates(xmoinsd, y - 1));
            }

            //check y bas
            if (xcalc + 1 <= 5 && y + 2 <= 5 && (!this._is_empty({_letter: xplus, _number: y + 2}))) {
                list.push(new Coordinates(xplus, y + 2));
            }
            if (xcalc - 1 >= 0 && y + 2 <= 5 && (!this._is_empty({_letter: xmoins, _number: y + 2}))) {
                list.push(new Coordinates(xmoins, y + 2));
            }

            //check y haut
            if (xcalc - 1 >= 0 && y - 2 >= 0 && (!this._is_empty({_letter: xmoins, _number: y - 2}))) {
                list.push(new Coordinates(xmoins, y - 2));
            }
            if (xcalc + 1 <= 5 && y - 2 >= 0 && (!this._is_empty({_letter: xplus, _number: y - 2}))) {
                list.push(new Coordinates(xplus, y - 2));
            }
        }//end if == 3


        //////Fou (Diagonal)//////
        if (piece._level === 4) {

            //check diagonale décroissante droite
            let j = y + 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }


            //check diagonale croissante droite
            j = y - 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante gauche
            j = y - 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale décroissante gauche
            j = y + 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }
        }//end if == 4


        //////Reine (Diagonal ET Orthogonal)//////
        if (piece._level === 5) {

            //Diagonales
            //check diagonale décroissante droite
            let j = y + 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante droite
            j = y - 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale décroissante gauche
            j = y + 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante gauche
            j = y - 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //Orthogonales
            for (let i = xcalc + 1; i < 5; ++i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }
                i = this._inverse_letter(i);
            }

            for (let i = xcalc - 1; i >= 0; --i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);
            }

            //check y
            for (let i = y + 1; i <= 5; ++i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }
            }

            for (let i = y - 1; i >= 0; --i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }

            }

        }//end if == 5

        return list;
    }

    _get_possible_moving_list_IA(piece) {

        //console.log("piece letter :", piece._coordinates._letter);

        let list = [];

        let xcalc = this._inverse_letter(piece._coordinates._letter);

        let xnorm = String.fromCharCode(piece._coordinates._letter.charCodeAt(0));
        let xplus = String.fromCharCode(piece._coordinates._letter.charCodeAt(0) + 1);
        let xmoins = String.fromCharCode(piece._coordinates._letter.charCodeAt(0) - 1);

        let y = piece._coordinates._number;
        let x = piece._coordinates._letter;

        //////Pion//////
        if (piece._level === 1) {
            //check x
            if (xcalc + 1 <= 5 && (this._is_empty({_letter: xplus, _number: y}) === false)) {
                list.push(new Coordinates(xplus, y));
            }

            if (xcalc - 1 >= 0 && (!this._is_empty({_letter: xmoins, _number: y}))) {
                list.push(new Coordinates(xmoins, y));
            }

            //check y
            if (y + 1 <= 5 && (!this._is_empty({_letter: xnorm, _number: y + 1}))) {
                list.push(new Coordinates(xnorm, y + 1));
            }
            if (y - 1 >= 0 && (!this._is_empty({_letter: xnorm, _number: y - 1}))) {
                list.push(new Coordinates(xnorm, y - 1));
            }
        }//end if == 1

        //////Tour (Orthogonal)//////
        if (piece._level === 2) {

            for (let i = xcalc + 1; i < 5; ++i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);

            }

            for (let i = xcalc - 1; i >= 0; --i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);
            }

            //check y
            for (let i = y + 1; i <= 5; ++i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }
            }

            for (let i = y - 1; i >= 0; --i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }

            }

        }//end if == 2


        //////Cavalier (Déplacement en L)//////
        if (piece._level === 3) {

            //check x droit
            let xplusd = String.fromCharCode(piece._coordinates._letter.charCodeAt(0) + 2);
            let xmoinsd = String.fromCharCode(piece._coordinates._letter.charCodeAt(0) - 2);

            if (xcalc + 2 <= 5 && y + 1 <= 5 && (!this._is_empty({_letter: xplusd, _number: y + 1}))) {

                list.push(new Coordinates(xplusd, y + 1));
            }
            if (xcalc + 2 <= 5 && y - 1 >= 0 && (!this._is_empty({_letter: xplusd, _number: y - 1}))) {
                list.push(new Coordinates(xplusd, y - 1));
            }


            //check x gauche
            if (xcalc - 2 >= 0 && y + 1 <= 5 && (!this._is_empty({_letter: xmoinsd, _number: y + 1}))) {
                list.push(new Coordinates(xmoinsd, y + 1));
            }
            if (xcalc - 2 >= 0 && y - 1 >= 0 && (!this._is_empty({_letter: xmoinsd, _number: y - 1}))) {
                list.push(new Coordinates(xmoinsd, y - 1));
            }


            //check y bas
            if (xcalc + 1 <= 5 && y + 2 <= 5 && (!this._is_empty({_letter: xplus, _number: y + 2}))) {
                list.push(new Coordinates(xplus, y + 2));
            }
            if (xcalc - 1 >= 0 && y + 2 <= 5 && (!this._is_empty({_letter: xmoins, _number: y + 2}))) {
                list.push(new Coordinates(xmoins, y + 2));
            }

            //check y haut
            if (xcalc - 1 >= 0 && y - 2 >= 0 && (!this._is_empty({_letter: xmoins, _number: y - 2}))) {
                list.push(new Coordinates(xmoins, y - 2));
            }
            if (xcalc + 1 <= 5 && y - 2 >= 0 && (!this._is_empty({_letter: xplus, _number: y - 2}))) {
                list.push(new Coordinates(xplus, y - 2));
            }
        }//end if == 3


        //////Fou (Diagonal)//////
        if (piece._level === 4) {

            //check diagonale décroissante droite
            let j = y + 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }


            //check diagonale croissante droite
            j = y - 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante gauche
            j = y - 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale décroissante gauche
            j = y + 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }
        }//end if == 4


        //////Reine (Diagonal ET Orthogonal)//////
        if (piece._level === 5) {

            //Diagonales
            //check diagonale décroissante droite
            let j = y + 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante droite
            j = y - 1;

            for (let i = xcalc + 1; i <= 5; ++i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //check diagonale décroissante gauche
            j = y + 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j <= 5) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                ++j;
                i = this._inverse_letter(i);
            }

            //check diagonale croissante gauche
            j = y - 1;

            for (let i = xcalc - 1; i >= 0; --i) {
                i = this._compute_letter(i, y);
                if (j >= 0) {
                    if (!this._is_empty({_letter: i, _number: j})) {
                        list.push(new Coordinates(i, j));
                        break;
                    }
                } else {
                    break;
                }
                --j;
                i = this._inverse_letter(i);
            }

            //Orthogonales
            for (let i = xcalc + 1; i < 5; ++i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }
                i = this._inverse_letter(i);
            }

            for (let i = xcalc - 1; i >= 0; --i) {

                i = this._compute_letter(i, y);

                if (!this._is_empty({_letter: i, _number: y})) {
                    list.push(new Coordinates(i, y));
                    break;
                }

                i = this._inverse_letter(i);
            }

            //check y
            for (let i = y + 1; i <= 5; ++i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }
            }

            for (let i = y - 1; i >= 0; --i) {

                if (!this._is_empty({_letter: x, _number: i})) {
                    list.push(new Coordinates(x, i));
                    break;
                }

            }

        }//end if == 5

        return list;
    }

    _compute_letter(x, y) {

        let _letter = 'X';

        if (x === 0) {
            _letter = 'A';
        }
        else if (x === 1) {
            _letter = 'B';
        }
        else if (x === 2) {
            _letter = 'C';
        }
        else if (x === 3) {
            _letter = 'D';
        }
        else if (x === 4) {
            _letter = 'E';
        }

        if (x < 0 || x > 5) {
            _letter = 'X';
        }

        return _letter;
    }


    _compute_number(x, y) {
        let _number = -1;

        if (y === 0) {
            _number = 1;
        }
        else if (y === 1) {
            _number = 2;
        }
        else if (y === 2) {
            _number = 3;
        }
        else if (y === 3) {
            _number = 4;
        }
        else if (y === 4) {
            _number = 5;
        }

        if (y < 0 || y > 5) {
            _number = -1;
        }

        return _number;
    }

    _inverse_letter(letter) {

        let x = -1;

        if (letter === "A") {
            x = 0;
        }
        else if (letter === "B") {
            x = 1;
        }
        else if (letter === "C") {
            x = 2;
        }
        else if (letter === "D") {
            x = 3;
        }
        else if (letter === "E") {
            x = 4;
        }

        if (letter !== "A" && letter !== "B" && letter !== "C" && letter !== "D" && letter !== 'E') {
            x = -2;
        }

        return x;
    }


    _inverse_number(number) {
        let y = -1;

        if (number === 1) {
            y = 0;
        }
        else if (number === 2) {
            y = 1;
        }
        else if (number === 3) {
            y = 2;
        }
        else if (number === 4) {
            y = 3;
        }
        else if (number === 5) {
            y = 4;
        }

        if (number !== 1 && number !== 2 && number !== 3 && number !== 4 && number !== 5) {
            y = -1;
        }

        return y;
    }


}

export default Engine;