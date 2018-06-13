import OpenXum from '../../openxum/engine.mjs';

import Coordinates from './coordinates.mjs';
import Piece from './piece.mjs';
import Color from './color.mjs';
import Move from './move.mjs';

class Engine extends OpenXum.Engine {
    constructor(type) {
       super();
       // Déclaration de tous les attributs nécessaires
        this._tabPiece=[];



       this._intersections = [];
    }

    apply_moves(moves) {
       // Permet d'appliquer une liste de coups.
       // Le paramètre moves contient un tableau d'objets Move.
    }

    clone() {
       // Permet de cloner le moteur de jeu.
       // Attention à bien dupliquer de tous les attributs.
    }

    current_color() {
       // Retourne le joueur en train de jouer.
    }

    get_name() {
       // Retourne le nom du jeu.
    }







    _get_possible_putting_list() {
        let list = [];

        // column
        for (let l = 'B'.charCodeAt(0); l <= 'H'.charCodeAt(0); ++l) {
            if (this._check_column(String.fromCharCode(l))) {
                list.push(new Coordinates(String.fromCharCode(l), begin_number[l - 'A'.charCodeAt(0)]));
                list.push(new Coordinates(String.fromCharCode(l), end_number[l - 'A'.charCodeAt(0)]));
            }
        }
        // line
        for (let n = 2; n <= 8; ++n) {
            if (this._check_line(n)) {
                list.push(new Coordinates(begin_letter[n - 1], n));
                list.push(new Coordinates(end_letter[n - 1], n));
            }
        }
        // diagonal
        for (let i = 2; i <= 8; ++i) {
            if (this._check_diagonal(i)) {
                list.push(new Coordinates(begin_diagonal_letter[i - 1], begin_diagonal_number[i - 1]));
                list.push(new Coordinates(end_diagonal_letter[i - 1], end_diagonal_number[i - 1]));
            }
        }
        return list;
    }


    _get_possible_putting_list(){
        let list = [];

        for (let i=0; i<5; ++i){
            for(let j=0; j<5 ; ++j ){
                if(_is_empty({_x: i, _y: j})){
                    list.push(new Coordinates({_x : i, _y : j}));
                }
            }
        }
        return list;
    }

    get_possible_move_list() {
       // Retourne la liste de tous les coups possibles
       // La liste retournée doit être un tableau d'objet Move.
    }

    is_finished() {
       // Retourne si la partie est terminée ou non.
    }

    move(move) {
        // Permet d'appliquer un coup et mets à jour l'état du jeu.
    }

    parse(str) {
       // Modifier l'état du jeu en fonction de l'état passé sous forme d'une
       // chaîne de caractères
    }

    to_string() {
       // Construit une représentation sous forme d'une chaîne de caractères
       // de l'état du jeu
    }

    winner_is() {
       // Indique le joueur qui a gagné.
    }

    _is_empty(coordinates) {
        let i = 0;

        if(this._tabPiece.length <=0){
            return true;
        }

        while (i < this._tabPiece.length) {
            if (this._tabPiece[i].x === coordinates.x && this._tabPiece[i].y === coordinates.y) {
                return false;
            } else {
                ++i;
            }
        }
        return true;
    }

}

export default Engine;