"use strict";

import OpenXum from '../../openxum/manager.mjs';
import Sixth from '../../../openxum-core/games/sixth/index.mjs';

class Manager extends OpenXum.Manager {
  constructor(e, g, o, s) {
    super(e, g, o, s);
    this.that(this);
  }

  build_move() {
    return new Sixth.Move();
  }

  get_current_color() {
    return this.engine().current_color() === Sixth.Color.WHITE ? 'White' : 'Black';
  }

  static get_name() {
    return 'sixth';
  }

  get_winner_color() {
    return this.engine().winner_is() === Sixth.Color.WHITE ? 'White' : 'Black';
  }

  process_move() { }
}

export default {
  Manager: Manager
};