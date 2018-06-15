"use strict";

// namespace Sixth
let Sixth = {};

import Gui from './gui.mjs';
import Manager from './manager.mjs';

Sixth = Object.assign(Sixth, Gui);
Sixth = Object.assign(Sixth, Manager);

export default Sixth;