"use strict";

// namespace sixth
import GameType from './game_type.mjs';
import Color from './color.mjs';
import Engine from './engine.mjs';
import MoveType from './move_type.mjs';
import State from './state.mjs';
import Phase from './phase.mjs';
import Intersection from './intersection.mjs';
import Move from './move.mjs';
import Coordinates from './coordinates.mjs';
import Piece from './piece.mjs';
import IA from './ia/ia_sixth_player.mjs';

export default {
    Color: Color,
    Phase: Phase,
    Intersection: Intersection,
    Piece: Piece,
    Coordinates: Coordinates,
    Engine: Engine,
    GameType: GameType,
    Move: Move,
    State: State,
    MoveType: MoveType,
    IA: IA
};