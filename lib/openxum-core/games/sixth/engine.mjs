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
const end_numbers = [1,2,3,4,5];

const letters = ['A', 'B', 'C', 'D', 'E'];
const numbers = [1, 2, 3, 4, 5];

class Engine extends OpenXum.Engine {
    constructor(t, c) {
        super();

        this._type = t;
        this._current_color = c;
        this._count_white_pawn = 13;
        this._count_black_pawn = 24;
        this._tabPiece = [];

        //this._tabPiece[0] = {_letter: this._letter, _number: this._number, _level : this._level};

        this._cases = [];

        this._phase = Phase.PUT_PIECE;
        //this._phase = Phase.MOVE_PIECE;

        this._initial_placed_piece_number = 0;

        for (let i=0; i< letters.length; ++i){
            for(let j=0; j<numbers.length ; ++j ){

                let letter = this._compute_letter(i, j);
                let number = this._compute_number(i, j);

                let coordinates = new Coordinates(letter, number);

                this._cases[coordinates.hash()] = new Intersection(coordinates);
            }
        }
    }

    // public methods
    apply_moves(moves) {

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
        let b = new Array(11);

        for(let i = 0; i < 11; i++) {
            b[i] = new Array(11);
        }

        for(let x = 0; x < 11; x++) {
            for(let y = 0; y < 11; y++) {
                if (this._board[x][y] !== undefined) {
                    b[x][y] = this._board[x][y].clone();
                }
            }
        }

        o._set(this._is_finished, this._winner_color, b, this._king);

        return o;
    }

    current_color() {
        return this._current_color;
    }

    phase() {
        return this._phase;
    }

    get_name() {
        return 'Sixth';
    }

    get_possible_move_list() {
        let moves = [];


        return moves;
    }

    get_type() {
        return this._type;
    }

    is_finished() {
        return this._phase === Phase.FINISH;
    }

    move(move) {

        let stack = [];

        if (move.constructor === Array) {
            console.log("move" , move[1].type());
            if (move[0].type() === MoveType.PUT_PIECE) {
                this._put_piece(move[0].coordinates(), this._current_color, 1);
            }
            if (move[1].type() === MoveType.MOVE_PIECE) {
                this._move_piece(move[1].from(), stack, 1, 1, move.to());
            }
        } else {
            if (move.type() === MoveType.PUT_PIECE) {
                this._put_piece(move.coordinates(), this._current_color, 1);
            }
            else if (move.type() === MoveType.MOVE_PIECE) {
                console.log("first if");
                this._move_piece(move.from(), stack, 1, 1, move.to());
                console.log("piece");
            }
        }

        /*
        this._check_pawn_taken(move);
        this._check_winner();

        if (!this.is_finished()) {
            this._change_color();
        }
        */
    }

    parse(str) {
        // TODO
    }

    to_string() {
        // TODO
    }

    winner_is() {
        return this._winner_color;
    }

    get_opponent_piece_next_to(piece, direction) {
        let x = piece.coordinates().x();
        let y = piece.coordinates().y();
        let op_piece = undefined;

        switch(direction) {
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

        if (op_piece !== undefined && op_piece.color() === piece.color())
        {
            op_piece = undefined;
        }

        return op_piece;
    }

    get_king() {
        return this._king;
    }

    get_count_black_pawn() {
        return this._count_black_pawn;
    }

    get_count_white_pawn() {
        return this._count_white_pawn;
    }

    get_distance_to(c1, c2) {
        return Math.abs(c1.x() - c2.x()) + Math.abs(c1.y() - c2.y());
    }

    equals(b1, b2) {

        for(let x = 0; x < 11; x++) {
            for(let y = 0; y < 11; y++) {
                let piece1 = b1._board[x][y];
                let piece2 = b2._board[x][y];

                if (piece1 !== undefined && !piece1.equals(piece2) || (piece2 !== undefined && !piece2.equals(piece1)))
                {
                    return false;
                }
            }
        }

        if (!b1.get_king().equals(b2.get_king())) return false;
        if (b1.is_finished() !== b2.is_finished()) return false;

        return true;
    }

    show_board() {
        console.log(" ");
        for(let x = 0; x < 11; x++) {
            let text = "";
            for(let y = 0; y < 11; y++) {
                let piece = this._board[x][y];

                if (piece === undefined) text += "*";
                else if (piece.isKing()) text += "K";
                else if (piece.color() === Color.WHITE) text +="W";
                else if (piece.color() === Color.BLACK) text += "B";
            }

            console.log(text);
        }
    }

    undo_move(move) {
        let pawns_taken = move.get_pawns_taken();

        this._board[move.to().x()][move.to().y()] = undefined;
        this._board[move.from().x()][move.from().y()] = move.piece();

        if (move.piece().isKing()) {
            this._king = move.piece();
        }

        for(let i = 0; i < pawns_taken.length; i++) {
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

    is_fortress(x, y) {
        return x == 0 && y == 0 || x == 0 && y == 10 || x == 10 && y == 0 || x == 10 && y == 10 || x == 5 && y == 5;
    }

    // private methods

    _set(isf, wc, b, k) {
        this._is_finished = isf;
        this._winner_color = wc;
        this._board = b;
        this._king = k;
    }

    _change_color() {
        this._color = (this._color === Color.WHITE) ? Color.BLACK : Color.WHITE;
    }

    _check_winner() {
        let whiteWins = this._board[0][0] !== undefined ||
                        this._board[10][0] !== undefined ||
                        this._board[0][10] !== undefined ||
                        this._board[10][10] !== undefined;

        let blackWins = true;

        for(let d = 0; d < 4; d ++) {
            if (this.get_opponent_piece_next_to(this._king, d) === undefined) {
                blackWins = false;
                break;
            }
        }

        if (this._color === Color.BLACK) {
            this._change_color();
            if (this.get_possible_move_list().length === 0) {
                blackWins = true;
            }
            this._change_color();
        }
        else {
            this._change_color();
            if (this.get_possible_move_list().length === 0) {
                whiteWins = true;
            }
            this._change_color();
        }

        if (blackWins) {
            this._winner_color = Color.BLACK;
            this._is_finished = true;
        }
        else if (whiteWins) {
            this._winner_color = Color.WHITE;
            this._is_finished = true;
        }
        else {
            this._winner_color = Color.NONE;
            this._is_finished = false;
        }
    }

    _check_pawn_taken(move) {
        let piece = this._board[move.to().x()][move.to().y()];
        let pawns_taken = [];

        for(let d = 0; d < 4; d++) {

            let op_piece = this.get_opponent_piece_next_to(piece, d);

            if (op_piece !== undefined && !op_piece.isKing() &&
                ((this.get_opponent_piece_next_to(op_piece, d) !== undefined) ||
                this._is_fortress_next_to(op_piece, d)) )
            {
                this._board[op_piece.coordinates().x()][op_piece.coordinates().y()] = undefined;
                pawns_taken.push(op_piece.clone());

                if (op_piece.color() === Color.WHITE) {
                    this._count_white_pawn--;
                }
                else {
                    this._count_black_pawn--;
                }
            }
        }

        move.set_pawns_taken(pawns_taken);
    }

    _put_piece(coordinates, color, level) {

        let possiblePut = this._get_possible_putting_list();

        let letter = coordinates._letter;
        let number = coordinates._number;

        for(let i = 0; i<possiblePut.length; ++i)
        {
            if(letter === possiblePut[i]._letter && number === possiblePut[i]._number)
            {
                let piece = new Piece(coordinates, color, level);
                this._tabPiece.push(piece);
            }
        }

        //console.log("tab piece : ",this._tabPiece);
    }

    _move_piece(corigine,stack,Alevel,nbPiece,cdestination){

            console.log("stack : ", stack);


        for(let i=0; i<this._tabPiece.length; ++i){
            if(cdestination._letter === this._tabPiece[i]._coordinates._letter && cdestination._number === this._tabPiece[i]._coordinates._number){
                console.log("tabPeice[i]: ", this._tabPiece[i]);

                this._tabPiece[i]._level+=nbPiece;

                for(let j=stack.length-nbPiece; j<stack.length; ++j){

                    console.log("j : ", j);

                    this._tabPiece[i]._stack.push(stack[j]);
                    console.log("stack : ", stack[j]);

                }

                break;
            }
        }

        for(let i=0; i<this._tabPiece.length;++i){
            if(corigine===this._tabPiece[i]._coordinates){
                if(Alevel<=nbPiece) {
                    this._tabPiece.splice(i,1);
                    break;
                }else{
                    this._tabPiece[i]._level-=nbPiece;
                    for(let j=0; j<nbPiece; ++j){
                        this._tabPiece[i]._stack.pop();
                    }
                    break;
                }
            }
        }

    }

    _verify_moving(letter, number) {
        let coordinates = new Coordinates(letter, number);
        let list = this._get_possible_putting_list();
        let found = false;

        for(let i=0; i<list.length; ++i){
            if(coordinates._letter === list[i]._letter && coordinates._number === list[i]._number){
                found = false;
            }else{
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

        if(this._is_empty(coordinates)){
            found = true;
        }else{
            found = false;
        }

        return found;
    }

    _get_possible_putting_list() {
        let list = [];

        for (let i=0; i<5; ++i){
            for(let j=0; j<5 ; ++j ){

                let letter = this._compute_letter(i, j);
                let number = this._compute_number(i, j);

                let coordinates = new Coordinates(letter, number);

                if(this._is_empty(coordinates)){

                    list.push(new Coordinates(letter, number));
                }
            }
        }

        return list;
    }

    _is_empty(coordinates) {
        let i = 0;

        if(this._tabPiece.length <=0){
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

    move_pawn(x, y, list){
        //check x
        if(x+1<5 && (!this._is_empty({_letter :x+1, _number :y }))){
            list.push(new Coordinates({_letter :x+1, _number :y }));
        }
        if(x-1>-1 && (!this._is_empty({_letter :x-1, _number :y }))) {
            list.push(new Coordinates({_letter: x-1, _number: y}));
        }

        //check y
        if(y+1<5 && (!this._is_empty({_letter :x, _number :y+1 }))){
            list.push(new Coordinates({_letter :x, _number :y+1 }));
        }
        if(y-1>-1 && (!this._is_empty({_letter :x, _number :y-1 }))) {
            list.push(new Coordinates({_letter: x, _number: y-1}));
        }
        return list;
    }// end pawn

    move_tower(x, y, list){
        //check x
        for(let i=x+1; i<5; ++i){

            if (!this._is_empty({_letter : i, _number :y })){
                list.push(new Coordinates({_letter :i, _number :y }));
                break;
            }
        }
        for(let i=x-1; i>-1; --i){

            if (!this._is_empty({_letter : i, _number :y })){
                list.push(new Coordinates({_letter :i, _number :y }));
                break;
            }
        }
        //check y
        for(let i=y+1; i<5; ++i){

            if (!this._is_empty({_letter : x , _number : i })){
                list.push(new Coordinates({_letter :x, _number : i }));
                break;
            }
        }
        for(let i=y-1; i>-1; --i){

            if (!this._is_empty({_letter : x, _number : i })){
                list.push(new Coordinates({_letter :x, _number : i }));
                break;
            }
        }
        return list;
    }// end tower

    move_knight(x, y, list){
        //check x droit
        if(x+2<5 && y+1<5 && (!this._is_empty({_letter :x+2, _number :y+1 }))){
            list.push(new Coordinates({_letter :x+2, _number :y+1 }));
        }
        if(x+2<5 && y-1>-1 && (!this._is_empty({_letter :x+2, _number :y-1 }))) {
            list.push(new Coordinates({_letter: x+2, _number: y-1}));
        }

        //check x gauche
        if(x-2>-1 && y+1<5 && (!this._is_empty({_letter :x-2, _number :y+1 }))){
            list.push(new Coordinates({_letter :x-2, _number :y+1 }));
        }
        if(x-2>-1 && y-1>-1 && (!this._is_empty({_letter :x-2, _number :y-1 }))) {
            list.push(new Coordinates({_letter: x-2, _number: y-1}));
        }


        //check y bas
        if(x+1<5 && y+2<5 && (!this._is_empty({_letter :x+1, _number :y+2 }))){
            list.push(new Coordinates({_letter :x+1, _number :y+2 }));
        }
        if(x-1>-1 && y+2<5 && (!this._is_empty({_letter :x-1, _number :y+2 }))){
            list.push(new Coordinates({_letter :x-1, _number :y+2 }));
        }

        //check y haut
        if(x-1>-1 && y-2>-1 && (!this._is_empty({_letter :x-1, _number :y-2 }))){
            list.push(new Coordinates({_letter :x-1, _number :y-2 }));
        }
        if(x+1<5 && y-2>-1 && (!this._is_empty({_letter :x+1, _number :y-2 }))) {
            list.push(new Coordinates({_letter: x+1, _number: y-2}));
        }
        return list;
    }// end knight

    move_bishop(x, y, list){
        //check diagonale décroissante droite
        let j=y+1;

        for(let i=x+1; i<5; ++i){

            if(j<5) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            ++j;
        }

        //check diagonale croissante droite
        j=y-1;

        for(let i=x+1; i<5; ++i){

            if(j>-1) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            --j;
        }

        //check diagonale décroissante gauche
        j=y+1;

        for(let i=x-1; i>-1; --i){

            if(j<5) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            ++j;
        }

        //check diagonale croissante gauche
        j=y-1;

        for(let i=x-1; i>-1; --i){

            if(j>-1) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            --j;
        }
        return list;
    }// end bishop

    move_queen(x, y, list){
        //Diagonales
        //check diagonale décroissante droite
        let j=y+1;

        for(let i=x+1; i<5; ++i){

            if(j<5) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            ++j;
        }

        //check diagonale croissante droite
        j=y-1;

        for(let i=x+1; i<5; ++i){

            if(j>-1) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            --j;
        }

        //check diagonale décroissante gauche
        j=y+1;

        for(let i=x-1; i>-1; --i){

            if(j<5) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            ++j;
        }

        //check diagonale croissante gauche
        j=y-1;

        for(let i=piece.co._letter-1; i>-1; --i){

            if(j>-1) {
                if (!this._is_empty({_letter: i, _number: j})) {
                    list.push(new Coordinates({_letter: i, _number: j}));
                    break;
                }
            }else{break;}
            --j;
        }


        //Orthogonales
        //check x
        for(let i=x+1; i<5; ++i){

            if (!this._is_empty({_letter : i, _number :y })){
                list.push(new Coordinates({_letter :i, _number :y }));
                break;
            }
        }
        for(let i=x-1; i>-1; --i){

            if (!this._is_empty({_letter : i, _number :y })){
                list.push(new Coordinates({_letter :i, _number :y }));
                break;
            }
        }
        //check y
        for(let i=y+1; i<5; ++i){

            if (!this._is_empty({_letter : x , _number : i })){
                list.push(new Coordinates({_letter :x, _number : i }));
                break;
            }
        }
        for(let i=y-1; i>-1; --i){

            if (!this._is_empty({_letter : x, _number : i })){
                list.push(new Coordinates({_letter :x, _number : i }));
                break;
            }
        }
        return list;
    }// end queen

    _get_possible_moving_list(piece) {

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

            for (let i = xcalc + 1; i <= 5; ++i) {

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
            if (xcalc + 2 < 5 && y - 1 > -1 && (!this._is_empty({_letter: xplusd, _number: y - 1}))) {
                list.push(new Coordinates(xplusd, y - 1));
            }


            //check x gauche
            if (xcalc - 2 > -1 && y + 1 < 5 && (!this._is_empty({_letter: xmoinsd, _number: y + 1}))) {
                list.push(new Coordinates(xmoinsd, y + 1));
            }
            if (xcalc - 2 > -1 && y - 1 > -1 && (!this._is_empty({_letter: xmoinsd, _number: y - 1}))) {
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
                        list.push(new Coordinates(i,j));
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
            for (let i = xcalc + 1; i <= 5; ++i) {

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

        if(x == 0){_letter = 'A';}
        else if(x == 1){_letter = 'B';}
        else if(x == 2){_letter = 'C';}
        else if(x == 3){_letter = 'D';}
        else if(x == 4){_letter = 'E';}

        if(x < 0 || x > 5){_letter = 'X';}

        return _letter;
    }


    _compute_number(x, y) {
        let _number = -1;

        if(y == 0){_number = 1;}
        else if(y == 1){_number = 2;}
        else if(y == 2){_number = 3;}
        else if(y == 3){_number = 4;}
        else if(y == 4){_number = 5;}

        if(y < 0 || y > 5){_number = -1;}

        return _number;
    }

    _inverse_letter(letter) {

        let x = -1;

        if(letter==="A"){x = 0;}
        else if(letter==="B"){x = 1;}
        else if(letter==="C"){x = 2;}
        else if(letter==="D"){x = 3;}
        else if(letter==="E"){x = 4;}

        if(letter !=="A" && letter !=="B" && letter !=="C" && letter !=="D" && letter !=='E')
        {
            x=-2;
        }

        return x;
    }


    _inverse_number(number) {
        let y = -1;

        if(number==1){y = 0;}
        else if(number==2){y = 1;}
        else if(number==3){y = 2;}
        else if(number==4){y = 3;}
        else if(number==5){y = 4;}

        if(number !=1 && number !=2 && number!=3 && number!=4 && number!=5){y=-1;}

        return y;
    }


}

export default Engine;