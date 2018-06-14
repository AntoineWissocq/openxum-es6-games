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
        let list = [];

        for (let i=0; i<5; ++i){
            for(let j=0; j<5 ; ++j ){
                if(this._is_empty({_x: i, _y: j})){
                    list.push(new Coordinates({_x : i, _y : j}));
                }
            }
        }
        return list;
    }

    get_possible_moving_list(piece) {
        
        let list = [];


        //Pion
        if(piece._lvl == 1)
        {
            //check x
            if(piece.coordinates._x+1<5 && (!_is_empty({_x :piece.coordinates._x+1, _y :piece.coordinates._y }))){
                list.push(new Coordinates({_x :piece.coordinates._x+1, _y :piece.coordinates._y }));
            }
            if(piece.coordinates._x-1>-1 && (!_is_empty({_x :piece.coordinates._x-1, _y :piece.coordinates._y }))) {
                list.push(new Coordinates({_x: piece.coordinates._x-1, _y: piece.coordinates._y}));
            }

            //check y
            if(piece.coordinates._y+1<5 && (!_is_empty({_x :piece.coordinates._x, _y :piece.coordinates._y+1 }))){
                list.push(new Coordinates({_x :piece.coordinates._x, _y :piece.coordinates._y+1 }));
            }
            if(piece.coordinates._y-1>-1 && (!_is_empty({_x :piece.coordinates._x, _y :piece.coordinates._y-1 }))) {
                list.push(new Coordinates({_x: piece.coordinates._x, _y: piece.coordinates._y-1}));
            }
        }//end if == 1


        //Tour (Orthogonal)
        if(piece._lvl == 2)
        {
            //check x
            for(let i=piece.coordinates._x+1; i<5; ++i){

                if (!_is_empty({_x : i, _y :piece.coordinates._y })){
                    list.push(new Coordinates({_x :i, _y :piece.coordinates._y }));
                    break;
                }
            }
            for(let i=piece.coordinates._x-1; i>-1; --i){

                if (!_is_empty({_x : i, _y :piece.coordinates._y })){
                    list.push(new Coordinates({_x :i, _y :piece.coordinates._y }));
                    break;
                }
            }
            //check y
            for(let i=piece.coordinates._y+1; i<5; ++i){

                if (!_is_empty({_x : piece.coordinates._x , _y : i })){
                    list.push(new Coordinates({_x :piece.coordinates._x, _y : i }));
                    break;
                }
            }
            for(let i=piece.coordinates._y-1; i>-1; --i){

                if (!_is_empty({_x : piece.coordinates._x, _y : i })){
                    list.push(new Coordinates({_x :piece.coordinates._x, _y : i }));
                    break;
                }
            }
        }//end if == 2


        //Cavalier (Déplacement en L)
        if(piece._lvl == 3)
        {

            //check x droit
            if(piece.coordinates._x+2<5 && piece.coordinates._y+1<5 && (!_is_empty({_x :piece.coordinates._x+2, _y :piece.coordinates._y+1 }))){
                list.push(new Coordinates({_x :piece.coordinates._x+2, _y :piece.coordinates._y+1 }));
            }
            if(piece.coordinates._x+2<5 && piece.coordinates._y-1>-1 && (!_is_empty({_x :piece.coordinates._x+2, _y :piece.coordinates._y-1 }))) {
                list.push(new Coordinates({_x: piece.coordinates._x+2, _y: piece.coordinates._y-1}));
            }

            //check x gauche
            if(piece.coordinates._x-2>-1 && piece.coordinates._y+1<5 && (!_is_empty({_x :piece.coordinates._x-2, _y :piece.coordinates._y+1 }))){
                list.push(new Coordinates({_x :piece.coordinates._x-2, _y :piece.coordinates._y+1 }));
            }
            if(piece.coordinates._x-2>-1 && piece.coordinates._y-1>-1 && (!_is_empty({_x :piece.coordinates._x-2, _y :piece.coordinates._y-1 }))) {
                list.push(new Coordinates({_x: piece.coordinates._x-2, _y: piece.coordinates._y-1}));
            }


            //check y bas
            if(piece.coordinates._x+1<5 && piece.coordinates._y+2<5 && (!_is_empty({_x :piece.coordinates._x+1, _y :piece.coordinates._y+2 }))){
                list.push(new Coordinates({_x :piece.coordinates._x+1, _y :piece.coordinates._y+2 }));
            }
            if(piece.coordinates._x-1>-1 && piece.coordinates._y+2<5 && (!_is_empty({_x :piece.coordinates._x-1, _y :piece.coordinates._y+2 }))){
                list.push(new Coordinates({_x :piece.coordinates._x-1, _y :piece.coordinates._y+2 }));
            }

            //check y haut
            if(piece.coordinates._x-1>-1 && piece.coordinates._y-2>-1 && (!_is_empty({_x :piece.coordinates._x-1, _y :piece.coordinates._y-2 }))){
                list.push(new Coordinates({_x :piece.coordinates._x-1, _y :piece.coordinates._y-2 }));
            }
            if(piece.coordinates._x+1<5 && piece.coordinates._y-2>-1 && (!_is_empty({_x :piece.coordinates._x+1, _y :piece.coordinates._y-2 }))) {
                list.push(new Coordinates({_x: piece.coordinates._x+1, _y: piece.coordinates._y-2}));
            }

        }//end if == 3


        //Fou (Diagonal)
        if(piece._lvl == 4)
        {
            //check diagonale décroissante droite
            let j=piece.coordinates._y+1;

            for(let i=piece.co._x+1; i<5; ++i){

                if(j<5) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                ++j;
            }

            //check diagonale croissante droite
            j=piece.coordinates._y-1;

            for(let i=piece.co._x+1; i<5; ++i){

                if(j>-1) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                --j;
            }

            //check diagonale décroissante gauche
            j=piece.coordinates._y+1;

            for(let i=piece.co._x-1; i>-1; --i){

                if(j<5) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                ++j;
            }

            //check diagonale croissante gauche
            j=piece.coordinates._y-1;

            for(let i=piece.co._x-1; i>-1; --i){

                if(j>-1) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                --j;
            }
        }//end if == 4



        //Reine (Diagonal ET Orthogonal)
        if(piece._lvl == 5)
        {
            //Diagonales
            //check diagonale décroissante droite
            let j=piece.coordinates._y+1;

            for(let i=piece.co._x+1; i<5; ++i){

                if(j<5) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                ++j;
            }

            //check diagonale croissante droite
            j=piece.coordinates._y-1;

            for(let i=piece.co._x+1; i<5; ++i){

                if(j>-1) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                --j;
            }

            //check diagonale décroissante gauche
            j=piece.coordinates._y+1;

            for(let i=piece.co._x-1; i>-1; --i){

                if(j<5) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                ++j;
            }

            //check diagonale croissante gauche
            j=piece.coordinates._y-1;

            for(let i=piece.co._x-1; i>-1; --i){

                if(j>-1) {
                    if (!_is_empty({_x: i, _y: j})) {
                        list.push(new Coordinates({_x: i, _y: j}));
                        break;
                    }
                }else{break;}
                --j;
            }


            //Orthogonales
            //check x
            for(let i=piece.coordinates._x+1; i<5; ++i){

                if (!_is_empty({_x : i, _y :piece.coordinates._y })){
                    list.push(new Coordinates({_x :i, _y :piece.coordinates._y }));
                    break;
                }
            }
            for(let i=piece.coordinates._x-1; i>-1; --i){

                if (!_is_empty({_x : i, _y :piece.coordinates._y })){
                    list.push(new Coordinates({_x :i, _y :piece.coordinates._y }));
                    break;
                }
            }
            //check y
            for(let i=piece.coordinates._y+1; i<5; ++i){

                if (!_is_empty({_x : piece.coordinates._x , _y : i })){
                    list.push(new Coordinates({_x :piece.coordinates._x, _y : i }));
                    break;
                }
            }
            for(let i=piece.coordinates._y-1; i>-1; --i){

                if (!_is_empty({_x : piece.coordinates._x, _y : i })){
                    list.push(new Coordinates({_x :piece.coordinates._x, _y : i }));
                    break;
                }
            }

        }//end if == 5

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