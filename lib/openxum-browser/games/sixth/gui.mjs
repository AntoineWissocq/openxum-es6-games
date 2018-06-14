"use strict";

import OpenXum from '../../openxum/gui.mjs';
import Sixth from '../../../openxum-core/games/sixth/index.mjs';
import Move from '../../../openxum-core/games/sixth/move.mjs';
import Coordinates from '../../../openxum-core/games/sixth/coordinates.mjs';
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


        this._selected_piece = null;
        this._selected_coordinates = null;
    }

    // public methods
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

        //cases
        this._show_cases();

        // reserve
        //this._draw_reserve();
        /*
         if (this._engine.phase() === Sixth.Phase.PUT_PIECE) {
         this._show_possible_putting();
         }
         */
    }


    get_move() {

        return this._move;
    }

    is_animate() {
        return false;
    }

    is_remote() {
        return false;
    }

    move(move, color) {
        this._manager.play();
        // TODO !!!!!
    }

    unselect() {
        this._selected_piece = undefined;
        this.draw();
    }


    set_canvas(c) {
        super.set_canvas(c);
        this._canvas.addEventListener("click", (e) => {
            let pos = this._get_click_position(e);
            if(pos.x >= 0 && pos.x <= 5 && pos.y >= 0 && pos.y <= 5)
                this._on_click(e);
        });

        this._deltaX = (this._canvas.width * 0.95 - 40) / 5;
        this._deltaY = (this._canvas.height * 0.95 - 40) / 5;
        this._offsetX = this._canvas.width / 2 - this._deltaX * 2.5;
        this._offsetY = this._canvas.height / 2 - this._deltaY * 2.5;

        this._canvas.addEventListener("mousemove", (e) => {
            this._on_move(e);
        });

        this.draw();
    }

    // private methods
    /*
     _get_click_position(e) {
     let rect = this._canvas.getBoundingClientRect();

     return {x: (e.clientX - rect.left) * this._scaleX, y: (e.clientY - rect.top) * this._scaleY};
     }
     */

    _get_click_position(e) {
        let rect = this._canvas.getBoundingClientRect();
        let x = (e.clientX - rect.left) * this._scaleX - this._offsetX;
        let y = (e.clientY - rect.top) * this._scaleY - this._offsetY;

        return { x: Math.floor(x / this._deltaX), y: Math.floor(y / this._deltaX) };
    }

    _on_move(event) {
        if (this._engine.current_color() === this._color || this._gui) {
            let pos = this._get_click_position(event);
            let letter = this._compute_letter(pos.x, pos.y);

            if (letter !== 'X') {
                let number = this._compute_number(pos.x, pos.y);

                if (number !== -1) {
                    if (this._compute_pointer(pos.x, pos.y)) {
                        this._manager.redraw();
                    }
                }
            }
        }
    }

    _on_click(event) {
        if (this._engine.current_color() === this._color || this._gui) {
            let pos = this._get_click_position(event);
            console.log(pos);
            let letter = this._compute_letter(pos.x, pos.y);

            if (letter !== 'X') {
                let number = this._compute_number(pos.x, pos.y);

                if (number !== -1) {
                    let ok = true;

                    let coordinates = new Coordinates(letter, number);

                    if (this._engine.phase() === Sixth.Phase.PUT_PIECE) {
                        if (this._engine._verify_putting(letter, number)){
                            ok = false;
                        }
                    }

                    if (ok) {
                        this._manager.play();
                        //this._draw_piece(letter, number, this._color, this._gui);
                    }

                    console.log("ok :", ok)
                }
            }
        }
    }

    _show_cases() {
        if (this._pointerX !== -1 && this._pointerY !== -1) {
            this._context.fillStyle = "#FF0000";
            this._context.strokeStyle = "#FF0000";
            this._context.lineWidth = 1;
            this._context.beginPath();
            this._context.arc(this._pointerX, this._pointerY, 5, 0.0, 2 * Math.PI);
            this._context.closePath();
            this._context.fill();
            this._context.stroke();
        }
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
        return [this._offsetX + x * this._deltaX + (this._deltaX / 2) - 1, this._offsetY + y * this._deltaY + (this._deltaY / 2) - 1];
    }


    _animate(val, deplacement) {
        let from = this._move.from();
        let to = this._move.to();

        let ptF = this._compute_coordinates(from.x(), from.y());
        let ptT = this._compute_coordinates(to.x(), to.y());

        let linearSpeed = 30;
        let newX = ptF[0];
        let newY = ptF[1];
        let continueAnimate = true;

        switch(deplacement) {
            case 0:
                newX = ptF[0] + val;
                continueAnimate = newX <= ptT[0];
                break;

            case 1:
                newX = ptF[0] - val;
                continueAnimate = newX >= ptT[0];
                break;

            case 2:
                newY = ptF[1] + val;
                continueAnimate = newY <= ptT[1];
                break;

            case 3:
                newY = ptF[1] - val;
                continueAnimate = newY >= ptT[1];
                break;
        }

        if (continueAnimate) {
            this.draw();
            this._draw_piece(newX, newY, this._move.piece());
            let that = this;
            setTimeout(function() {
                that._animate(val + 6, deplacement);
            }, 10);

        }
        else {
            this.draw();
            this._draw_piece(ptT[0], ptT[1], this._move.piece());
            let that = this;
            setTimeout(function() {
                that._manager.play();
            }, 50);

        }
    }

    _animate_move() {

        //Remove temporary the piece from the board to animate
        this._engine._board[this._selected_piece.coordinates().x()][this._selected_piece.coordinates().y()] = undefined;

        let that = this;
        let deplacement = -1;

        let from = this._move.from();
        let to = this._move.to();

        if (from.x() < to.x()) deplacement = 0;
        if (from.x() > to.x()) deplacement = 1;
        if (from.y() < to.y()) deplacement = 2;
        if (from.y() > to.y()) deplacement = 3;

        setTimeout(function() {
            that._animate(2, deplacement);
        }, 50);
    }


    _show_cases() {
        if (this._pointerX !== -1 && this._pointerY !== -1) {

            let latitude = this._offsetX + this._pointerX * this._deltaX + (this._deltaX/2);
            let longitude = this._offsetY + this._pointerY * this._deltaY + (this._deltaY/2);

            let letter = this._compute_letter(latitude,longitude);
            let number = this._compute_number(latitude,longitude);

            let coordinates = new Coordinates(letter, number);

            if(this._engine._is_empty(coordinates)) {
                this._context.fillStyle = "#3CC52A";
                this._context.strokeStyle = "#3CC52A";
                this._context.lineWidth = 1;
                this._context.beginPath();
                this._context.arc(latitude, longitude, 5, 0.0, 2 * Math.PI);
                this._context.closePath();
                this._context.fill();
                this._context.stroke();
            }
            else
            {
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

    _draw_state() {
        console.log('test :', this._engine._tabPiece);
        for (let index in this._engine._tabPiece) {
            let intersection = this._engine._tabPiece[index];

            if (intersection.state() !== Sixth.State.VACANT) {
                let pt = this._compute_coordinates(intersection.letter().charCodeAt(0), intersection.number());
                // this._stack = couleurs étages pieces
                this._draw_piece(pt[0], pt[1], intersection.color(), intersection.gipf());
            }
        }
    }

    _draw_piece(letter, number, color, sixth) {
        let latitude = this._offsetX + this._pointerX * this._deltaX + (this._deltaX/2);
        let longitude = this._offsetY + this._pointerY * this._deltaY + (this._deltaY/2);
        console.log(latitude);
        console.log(longitude);
        if (color === 0) {
            this._context.strokeStyle = "#000000";
            this._context.fillStyle = "#000000";
        } else {
            this._context.strokeStyle = "#ffffff";
            this._context.fillStyle = "#ffffff";
        }
        this._context.beginPath();
        this._context.arc(latitude, longitude, this._deltaX * (1.0 / 3 + 1.0 / 10), 0.0, 2 * Math.PI);
        this._context.closePath();
        this._context.fill();

        if (color === 1) {
            this._context.strokeStyle = "#000000";
            this._context.fillStyle = "#000000";
        } else {
            this._context.strokeStyle = "#ffffff";
            this._context.fillStyle = "#ffffff";
        }

        this._context.lineWidth = 3;
        this._context.beginPath();
        this._context.arc(latitude, longitude, this._deltaX * (1.0 / 3 + 1.0 / 10), 0.0, 2 * Math.PI);
        this._context.closePath();
        this._context.stroke();

        if (sixth) {
            this._context.beginPath();
            this._context.arc(x, y, this._delta_x * (1.0 / 3 + 1.0 / 10) / 2, 0.0, 2 * Math.PI);
            this._context.closePath();
            this._context.stroke();
        }
    }

    _draw_coordinates() {

        this._context.strokeStyle = "#FFFFFF";
        this._context.fillStyle = "#FFFFFF";
        this._context.font = "30px serif";
        this._context.textBaseline = "top";

        //letters
        for(let i = 0; i < 5; i++) {
            let lat = this._offsetX + i * this._deltaX + (this._deltaX/2) - 15;
            let lett = begin_letters[i]
            this._context.fillText(lett, lat, 0);
        }

        //numbers
        for(let i = 0; i < 5; i++) {
            let long = this._offsetY + i * this._deltaY + (this._deltaY/2) - 15;
            let numb = begin_numbers[i]
            this._context.fillText(numb, 10, long);
        }
    }

    _draw_selected_piece() {
        let x = this._selected_piece.coordinates().x();
        let y = this._selected_piece.coordinates().y();
        let possible_moves = this._engine._get_possible_move_list(this._selected_piece);
        let pt = this._compute_coordinates(x, y);
        let radius = (this._deltaX / 2.3);

        this._context.lineWidth = 4;
        this._context.strokeStyle = "#d8370f";
        this._context.beginPath();
        this._context.arc(pt[0], pt[1], radius, 0.0, 2 * Math.PI);
        this._context.closePath();
        this._context.stroke();

        this._context.fillStyle = "#d8370f";
        radius = (this._deltaX / 10);

        for(let i = 0; i < possible_moves.length; i++) {
            let move = possible_moves[i];
            pt = this._compute_coordinates(move.to().x(), move.to().y());

            this._context.beginPath();
            this._context.arc(pt[0], pt[1], radius, 0.0, 2 * Math.PI);
            this._context.closePath();
            this._context.fill();
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

    _round_rect(x, y, width, height, radius, fill, stroke) {
        this._context.clearRect(x,y, width, height);
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