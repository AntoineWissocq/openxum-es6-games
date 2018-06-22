"use strict";

import OpenXum from '../../openxum/gui.mjs';
import Sixth from '../../../openxum-core/games/sixth/index.mjs';
import Move from '../../../openxum-core/games/sixth/move.mjs';
import Coordinates from '../../../openxum-core/games/sixth/coordinates.mjs';
import Phase from '../../../openxum-core/games/sixth/phase.mjs';
import Intersection from '../../../openxum-core/games/sixth/intersection.mjs';

const begin_letters = ['A', 'B', 'C', 'D', 'E'];
const begin_numbers = [1, 2, 3, 4, 5];

const letters = ['A', 'B', 'C', 'D', 'E'];

class Gui extends OpenXum.Gui {
    constructor(c, e, l, g) {
        super(c, e, l, g);

        this._tolerance = 15;
        this._deltaX = 0;
        this._deltaY = 0;
        this._offsetX = 0;
        this._offsetY = 0;
        this._offset = 0;
        this._pointerX = -1;
        this._pointerY = -1;

        this._NbPiece = 0;

        this._selected_case = null;
        this._selected_piece = null;
        this._origin_piece = null;

        this._possible_move_list = null;
        this._selected_coordinates = null;
    }

    ///////// public methods //////////

    draw() {
        this._context.lineWidth = 1;

        // background
        this._context.fillStyle = "#21177D";
        this._round_rect(0, 0, this._canvas.width, this._canvas.height, 17, true, false);

        //grid
        this._draw_grid();
        this._draw_coordinates();

        //state
        this._draw_state();

        // reserve
        //this._draw_reserve();

        if (this._possible_move_list) {
            this._draw_possible_move();
        }
    }


    get_move() {
        let move = null;

        console.log("origin level :",this._origin_piece);

        if (this._engine.phase() === Sixth.Phase.PUT_PIECE) {
            move = new Sixth.Move(Sixth.MoveType.PUT_PIECE, this._engine.current_color(), this._selected_case);
        }
        else if (this._engine.phase() === Sixth.Phase.MOVE_PIECE) {
            move = new Sixth.Move(Sixth.MoveType.MOVE_PIECE, this._engine.current_color(), this._selected_piece,
                this._selected_case, this._engine.current_stack(this._selected_piece), this._engine.current_level(this._origin_piece), this._engine.current_nbpiece(this._NbPiece));
        }

        return move;
    }

    phase() {
        return this._phase;
    }

    is_animate() {
        return false;
    }

    is_remote() {
        return false;
    }

    move(move, color) {
        this._manager.play();
        console.log("tabpiece :", JSON.stringify(this._engine._tabPiece));
        // TODO !!!!!
    }

    unselect() {
        this._selected_coordinates = null;
        if (this._engine.phase() === Sixth.Phase.MOVE_PIECE) {
            this._selected_piece = null;
            this._origin_piece = null;
        }
        this._selected_case = null;
    }

    set_canvas(c) {
        super.set_canvas(c);

        this._canvas.addEventListener("click", (e) => {
            let pos = this._get_click_position(e);
            if (pos.x >= 0 && pos.x <= 5 && pos.y >= 0 && pos.y <= 5) {
                this._on_click(e);
                this._show_cases(e);
            }
        });

        this._canvas.addEventListener("mousemove", (e) => {
            this._on_move(e);
            this._show_cases(e);
        });

        this._deltaX = (this._canvas.width * 0.95 - 40) / 5;
        this._deltaY = (this._canvas.height * 0.95 - 40) / 5;
        this._offsetX = this._canvas.width / 2 - this._deltaX * 2.5;
        this._offsetY = this._canvas.height / 2 - this._deltaY * 2.5;

        this.draw();
    }

    // private methods

    //////////EVENT////////

    _get_click_position(e) {
        let rect = this._canvas.getBoundingClientRect();

        let x = (e.clientX - rect.left) * this._scaleX - this._offsetX;
        let y = (e.clientY - rect.top) * this._scaleY - this._offsetY;

        return {x: Math.floor(x / this._deltaX), y: Math.floor(y / this._deltaX)};
    }

    _on_move(event) {
        if (this._engine.current_color() === this._color || this._gui) {
            let pos = this._get_click_position(event);
            let letter = this._compute_letter(pos.x, pos.y);
            let number = this._compute_number(pos.x, pos.y);

            if (letter !== 'X' && number !== -1) {
                if (this._compute_pointer(pos.x, pos.y)) {
                    this._manager.redraw();
                }
            }
        }
    }

    _on_click(event) {
        if (this._engine.current_color() === this._color || this._gui) {

            let pos = this._get_click_position(event);
            let letter = this._compute_letter(pos.x, pos.y);
            let number = this._compute_number(pos.x, pos.y);

            if (letter !== 'X' && number !== -1) {
                let ok = false;
                let coordinates = new Coordinates(letter, number);

                if (this._engine._is_empty(coordinates)) {
                    this._engine._phase = Phase.PUT_PIECE;
                    if (this._engine._verify_putting(letter, number)) {
                        this._selected_case = new Sixth.Coordinates(letter, number);
                        this._selected_piece = null;
                        this._origin_piece = null;
                        ok = true;
                        console.log("case vide");
                    }
                }
                else {
                    let select = this._find_piece(pos.x, pos.y);

                    if (select) {

                        if (this._selected_piece !== null && this._selected_piece._letter === select._letter && this._selected_piece._number === select._number) {
                            this._selected_piece = null;
                            this._origin_piece = null;
                            this._possible_move_list = null;
                        }
                        else if (this._selected_piece === null && this._engine._verify_moving(letter, number)) {

                            let rect = this._canvas.getBoundingClientRect();
                            let y = (event.clientY - rect.top) * this._scaleY - this._offsetY;

                            let pos_click_nbpiece = Math.ceil((this._deltaY - Math.floor(y - (pos.y * this._deltaY))) / 12);

                            const select = this._find_piece(pos.x, pos.y);
                            const origin = this._find_piece(pos.x, pos.y);

                            if(pos_click_nbpiece > select._level)
                            {
                                pos_click_nbpiece = select._level;
                            }

                            this._origin_piece = origin;
                            this._origin_piece._level = origin._level;

                            this._NbPiece = (select._level - pos_click_nbpiece + 1);
                            select._level = this._NbPiece;

                            this._selected_piece = select;

                            //console.log("piece selected :", this._selected_piece);

                            this._possible_move_list = this._engine._get_possible_moving_list(this._selected_piece);
                            this._engine._phase = Phase.MOVE_PIECE;
                            this.draw();
                        }
                        else {
                            this._selected_case = new Sixth.Coordinates(letter, number);

                            for (let i = 0; i < this._possible_move_list.length; i++) {
                                if (this._possible_move_list[i]._letter === this._selected_case._letter
                                    && this._possible_move_list[i]._number === this._selected_case._number) {
                                    ok = true;
                                }
                            }
                        }

                        //console.log("tab piece :", JSON.stringify(this._engine._tabPiece));
                        //console.log("select piece :", this._selected_piece);
                    }
                }

                if (ok) {
                    this._manager.play();
                }
                console.log("ok :", ok);

            }
        }
    }

    _find_piece(x, y) {

        let k = 0;
        let found = false;
        let piece;
        let st;
        let lvl;

        if (this._engine.current_color() === Sixth.Color.BLACK) {
            piece = this._engine._black_piece;
        } else {
            piece = this._engine._white_piece;
        }

        while (!found && k < 15 && piece !== []) {

            let coordx = this._engine._inverse_letter(piece[k]._coordinates._letter);
            let coordy = this._engine._inverse_number(piece[k]._coordinates._number);
            st = piece[k]._stack;
            lvl = piece[k]._level;
            //console.log("lvl piece :",piece[k]._level);
            //console.log("lvl :",lvl);

            if (coordx === x && coordy === y) {
                found = true;
            } else {
                ++k;
            }
        }

        x = this._compute_letter(x, y);
        y = this._compute_number(x, y);

        if (found) {
            return {_letter: x, _number: y, piece_color: this._engine.current_color(), _level: lvl, _stack: st};
        } else {
            return null;
        }
    }

    ///////COMPUTE//////

    _compute_letter(x, y) {

        let _letter = 'X';

        if (x == 0) {
            _letter = 'A';
        }
        else if (x == 1) {
            _letter = 'B';
        }
        else if (x == 2) {
            _letter = 'C';
        }
        else if (x == 3) {
            _letter = 'D';
        }
        else if (x == 4) {
            _letter = 'E';
        }

        if (x < 0 || x > 5) {
            _letter = 'X';
        }

        return _letter;
    }


    _compute_number(x, y) {
        let _number = -1;

        if (y == 0) {
            _number = 1;
        }
        else if (y == 1) {
            _number = 2;
        }
        else if (y == 2) {
            _number = 3;
        }
        else if (y == 3) {
            _number = 4;
        }
        else if (y == 4) {
            _number = 5;
        }

        if (y < 0 || y > 5) {
            _number = -1;
        }

        return _number;
    }

    _compute_pointer(x, y) {
        let change = false;
        let letter = this._compute_letter(x, y);

        if (letter !== 'X') {
            let number = this._compute_number(x, y);

            if (number !== -1) {
                if (this._engine._exist_intersection(letter, number)) {
                    this._pointerX = x;
                    this._pointerY = y;
                    change = true;
                } else {
                    this._pointerX = this._pointerY = -1;
                    change = true;
                }
            } else {
                if (this._pointerX !== -1) {
                    this._pointerX = this._pointerY = -1;
                    change = true;
                }
            }
        } else {
            if (this._pointerX !== -1) {
                this._pointerX = this._pointerY = -1;
                change = true;
            }
        }
        return change;
    }

    _compute_coordinates(x, y) {
        return {
            x: this._offsetX + x * this._deltaX + (this._deltaX / 2) - 1,
            y: this._offsetY + y * this._deltaY + (this._deltaY / 2) - 1
        };
    }

    _show_cases(event) {
        if (this._pointerX !== -1 && this._pointerY !== -1) {

            let pos = this._get_click_position(event);
            let x = pos.x;
            let y = pos.y;

            let latitude = this._offsetX + this._pointerX * this._deltaX + (this._deltaX / 2);
            let longitude = this._offsetY + this._pointerY * this._deltaY + (this._deltaY / 2);

            let letter = this._compute_letter(x, y);
            let number = this._compute_number(x, y);
            let coordinates = new Coordinates(letter, number);

            if (this._engine._is_empty(coordinates)) {
                this._context.fillStyle = "#3CC52A";
                this._context.strokeStyle = "#3CC52A";
                this._context.lineWidth = 1;
                this._context.beginPath();
                this._context.arc(latitude, longitude, 5, 0.0, 2 * Math.PI);
                this._context.closePath();
                this._context.fill();
                this._context.stroke();
            }
            else {
                this._context.fillStyle = "#FF0000";
                this._context.strokeStyle = "#FF0000";
                this._context.lineWidth = 1;
                this._context.beginPath();
                this._context.arc(latitude, longitude, 5, 0.0, 2 * Math.PI);
                this._context.closePath();
                this._context.fill();
                this._context.stroke();
            }


        }
    }

    /*
     DRAW CROSS X
     var c = document.getElementById("myCanvas");
     var canvas = document.getElementById("myCanvas");
     var ctx = c.getContext("2d");
     ctx.lineWidth = 1;
     ctx.beginPath();
     ctx.moveTo(0, 0);
     ctx.lineTo(canvas.width, canvas.height);
     ctx.stroke();
     ctx.lineWidth = 1;
     ctx.beginPath();
     ctx.moveTo(canvas.width, 0);
     ctx.lineTo(0, canvas.height);
     ctx.stroke();
     */

    ////////DRAW/////////

    _draw_state() {

        for (let i = 0; i < this._engine._tabPiece.length; ++i) {
            let intersection = this._engine._cases[i];

            let letter = this._engine._tabPiece[i]._coordinates._letter;
            let number = this._engine._tabPiece[i]._coordinates._number;
            let color = this._engine._tabPiece[i]._color;

            let stack = this._engine._tabPiece[i]._stack;
            let level = this._engine._tabPiece[i]._level;

            this._draw_piece(letter, number, color, intersection.sixth(), stack, level);
        }
    }

    _draw_piece(letter, number, color, sixth, stack, level) {

        let lat = this._engine._inverse_letter(letter);
        let long = this._engine._inverse_number(number);
        let latitude = this._offsetX + lat * this._deltaX + (this._deltaX / 2);
        let longitude = this._offsetY + long * this._deltaY + (this._deltaY / 2);

        if (level !== 1) {
            for (let i = 0; i <= stack.length -1 ; i++) {

                this._context.save();
                this._context.translate(0, longitude - (i * 12) + 2*(this._deltaX * (1.0 / 3 + 1.0 / 10))/3);
                if (stack[i] === Sixth.Color.BLACK) {
                    this._context.strokeStyle = "#000000";
                    this._context.fillStyle = "#000000";
                } else {
                    this._context.strokeStyle = "#ffffff";
                    this._context.fillStyle = "#ffffff";
                }
                this._context.scale(1, 1/3);
                this._context.beginPath();
                this._context.arc(latitude, 0, this._deltaX * (1.0 / 3 + 1.0 / 10), 2 * Math.PI, false);
                this._context.closePath();
                this._context.fill();
                this._context.stroke();
                this._context.restore();

                this._context.save();
                this._context.translate(0, longitude - (i * 12) + 2*(this._deltaX * (1.0 / 3 + 1.0 / 10))/3);
                if (stack[i] === Sixth.Color.WHITE) {
                    this._context.strokeStyle = "#000000";
                    this._context.fillStyle = "#000000";
                } else {
                    this._context.strokeStyle = "#ffffff";
                    this._context.fillStyle = "#ffffff";
                }
                this._context.scale(1, 1/3);
                this._context.lineWidth = 3;
                this._context.beginPath();
                this._context.arc(latitude, 0, this._deltaX * (1.0 / 3 + 1.0 / 10), 0.0, 2 * Math.PI);
                this._context.closePath();
                this._context.stroke();
                this._context.restore();
            }
            return;

        } else {

            this._context.save();
            this._context.translate(0, longitude + 2*(this._deltaX * (1.0 / 3 + 1.0 / 10))/3);
            if (stack[stack.length - 1] === Sixth.Color.BLACK) {
                this._context.strokeStyle = "#000000";
                this._context.fillStyle = "#000000";
            } else {
                this._context.strokeStyle = "#ffffff";
                this._context.fillStyle = "#ffffff";
            }
            this._context.scale(1, 1/3);
            this._context.beginPath();
            this._context.arc(latitude, 0 , this._deltaX * (1.0 / 3 + 1.0 / 10), 2 * Math.PI, false);
            this._context.closePath();
            this._context.fill();
            this._context.stroke();
            this._context.restore();

            this._context.save();
            this._context.translate(0, longitude + 2*(this._deltaX * (1.0 / 3 + 1.0 / 10))/3);
            if (stack[stack.length - 1] === Sixth.Color.WHITE) {
                this._context.strokeStyle = "#000000";
                this._context.fillStyle = "#000000";
            } else {
                this._context.strokeStyle = "#ffffff";
                this._context.fillStyle = "#ffffff";
            }
            this._context.scale(1, 1/3);
            this._context.lineWidth = 3;
            this._context.beginPath();
            this._context.arc(latitude, 0, this._deltaX * (1.0 / 3 + 1.0 / 10), 0.0, 2 * Math.PI);
            this._context.closePath();
            this._context.stroke();
            this._context.restore();
        }
    }

    _draw_possible_move() {

        for (let i = 0; i < this._possible_move_list.length; ++i) {

            let test = this._possible_move_list[i]._letter;
            let test2 = this._possible_move_list[i]._number;

            let coordx = this._engine._inverse_letter(test);
            let coordy = this._engine._inverse_number(test2);

            const x = this._offsetX + coordx * this._deltaX + (this._deltaX / 2);
            const y = this._offsetX + coordy * this._deltaX + (this._deltaX / 2);

            this._context.fillStyle = "#1187FF";
            this._context.strokeStyle = "#1187FF";
            this._context.lineWidth = 1;
            this._context.beginPath();
            this._context.arc(x, y, 5, 0.0, 2 * Math.PI);
            this._context.closePath();
            this._context.fill();
            this._context.stroke();
        }
    }

    _draw_coordinates() {

        this._context.strokeStyle = "#FFFFFF";
        this._context.fillStyle = "#FFFFFF";
        this._context.font = "30px serif";
        this._context.textBaseline = "top";

        //letters
        for (let i = 0; i < 5; i++) {
            let lat = this._offsetX + i * this._deltaX + (this._deltaX / 2) - 15;
            let lett = begin_letters[i];
            this._context.fillText(lett, lat, 0);
        }

        //numbers
        for (let i = 0; i < 5; i++) {
            let long = this._offsetY + i * this._deltaY + (this._deltaY / 2) - 15;
            let numb = begin_numbers[i];
            this._context.fillText(numb, 10, long);
        }
    }

    _draw_grid() {
        let i, j;

        this._context.lineWidth = 1;
        this._context.strokeStyle = "#000000";
        this._context.fillStyle = "#C0BEBE";

        for (i = 0; i < 5; ++i) {
            for (j = 0; j < 5; ++j) {
                this._context.beginPath();
                this._context.moveTo(this._offsetX + i * this._deltaX, this._offsetY + j * this._deltaY);
                this._context.lineTo(this._offsetX + (i + 1) * this._deltaX - 2, this._offsetY + j * this._deltaY);
                this._context.lineTo(this._offsetX + (i + 1) * this._deltaX - 2, this._offsetY + (j + 1) * this._deltaY - 2);
                this._context.lineTo(this._offsetX + i * this._deltaX, this._offsetY + (j + 1) * this._deltaY - 2);
                this._context.moveTo(this._offsetX + i * this._deltaX, this._offsetY + j * this._deltaY);

                this._context.closePath();
                this._context.fill();
            }
        }
    }

    /*
     _draw_reserve() {

     this._context.lineWidth = 1;
     this._context.strokeStyle = "#000000";
     this._context.fillStyle = "#000000";
     for (let i = 0; i < this._engine._black_piece_number; ++i) {
     this._context.beginPath();
     this._context.rect(10 + i * 10, 10, 5, 15);
     this._context.closePath();
     this._context.stroke();
     this._context.fill();
     }
     this._context.fillStyle = "#ffffff";
     for (let i = 0; i < this._engine._white_piece_number; ++i) {
     this._context.beginPath();
     this._context.rect(10 + i * 10, 30, 5, 15);
     this._context.closePath();
     this._context.stroke();
     this._context.fill();
     }
     this._context.lineWidth = 3;
     this._context.strokeStyle = "#ff0000";
     this._context.fillStyle = "#000000";
     for (let i = 0; i < this._engine._black_captured_piece_number; ++i) {
     this._context.beginPath();
     this._context.rect(10 + (this._engine._black_piece_number + i) * 10, 10, 5, 15);
     this._context.closePath();
     this._context.stroke();
     this._context.fill();
     }
     this._context.fillStyle = "#ffffff";
     for (let i = 0; i < this._engine._white_captured_piece_number; ++i) {
     this._context.beginPath();
     this._context.rect(10 + (this._engine._white_piece_number + i) * 10, 30, 5, 15);
     this._context.closePath();
     this._context.stroke();
     this._context.fill();
     }
     }
     */

    ///////round//////

    _round_rect(x, y, width, height, radius, fill, stroke) {
        this._context.clearRect(x, y, width, height);
        if (typeof stroke === "undefined") {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        this._context.beginPath();
        this._context.moveTo(x + radius, y);
        this._context.lineTo(x + width - radius, y);
        this._context.quadraticCurveTo(x + width, y, x + width, y + radius);
        this._context.lineTo(x + width, y + height - radius);
        this._context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this._context.lineTo(x + radius, y + height);
        this._context.quadraticCurveTo(x, y + height, x, y + height - radius);
        this._context.lineTo(x, y + radius);
        this._context.quadraticCurveTo(x, y, x + radius, y);
        this._context.closePath();
        if (stroke) {
            this._context.stroke();
        }
        if (fill) {
            this._context.fill();
        }
    }


}

export default {
    Gui: Gui
};