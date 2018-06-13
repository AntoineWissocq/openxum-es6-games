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

    _get_possible_putting_list(){

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
        let empty = false;
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