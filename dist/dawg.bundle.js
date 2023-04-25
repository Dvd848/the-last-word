"use strict";
(self["webpackChunkthe_last_word"] = self["webpackChunkthe_last_word"] || []).push([[4],{

/***/ 701:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$": () => (/* binding */ CompletionDAWG)
/* harmony export */ });
/* harmony import */ var _dawg_wrapper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(765);
/*
This code was ported from Python to Javascript based on reference code from:
https://github.com/pytries/DAWG-Python/

The original code was licensed under MIT license:

    Copyright (c) Mikhail Korobov, 2012

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is furnished
    to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
    A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class CompletionDAWG {
    constructor() {
        this.dct = null;
        this.guide = null;
    }
    keys(prefix = "") {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder("utf-8");
        const b_prefix = encoder.encode(prefix);
        const res = [];
        if ((this.dct == null) || (this.guide == null)) {
            throw "Dictionary must be loaded first!";
        }
        const index = this.dct.follow_bytes(b_prefix, this.dct.ROOT);
        if (index === null) {
            return res;
        }
        const completer = new _dawg_wrapper__WEBPACK_IMPORTED_MODULE_0__/* .Completer */ .XB(this.dct, this.guide);
        completer.start(index, b_prefix);
        while (completer.next()) {
            let key = decoder.decode(new Uint8Array(completer.key));
            res.push(key);
        }
        return res;
    }
    edges(prefix = "") {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder("utf-8");
        const b_prefix = encoder.encode(prefix);
        const res = [];
        if ((this.dct == null) || (this.guide == null)) {
            throw "Dictionary must be loaded first!";
        }
        const index = this.dct.follow_bytes(b_prefix, this.dct.ROOT);
        if (index === null) {
            return res;
        }
        const completer = new _dawg_wrapper__WEBPACK_IMPORTED_MODULE_0__/* .Completer */ .XB(this.dct, this.guide);
        if (!completer.start_edges(index, b_prefix)) {
            return res;
        }
        let key = decoder.decode(new Uint8Array(completer.key));
        res.push(key.slice(-1));
        while (completer.next_edge()) {
            key = decoder.decode(new Uint8Array(completer.key));
            res.push(key.slice(-1));
        }
        return res;
    }
    contains(key) {
        const encoder = new TextEncoder();
        const b_key = encoder.encode(key);
        if ((this.dct == null) || (this.guide == null)) {
            throw "Dictionary must be loaded first!";
        }
        return this.dct.contains(b_key);
    }
    load(raw_bytes) {
        this.dct = new _dawg_wrapper__WEBPACK_IMPORTED_MODULE_0__/* .Dictionary */ .Xy();
        this.guide = new _dawg_wrapper__WEBPACK_IMPORTED_MODULE_0__/* .Guide */ .fD();
        this.dct.read(raw_bytes);
        this.guide.read(raw_bytes);
        return this;
    }
}


/***/ }),

/***/ 163:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PS": () => (/* binding */ label),
/* harmony export */   "S3": () => (/* binding */ value),
/* harmony export */   "Wf": () => (/* binding */ PRECISION_MASK),
/* harmony export */   "cv": () => (/* binding */ offset),
/* harmony export */   "yI": () => (/* binding */ has_leaf)
/* harmony export */ });
/* unused harmony exports OFFSET_MAX, IS_LEAF_BIT, HAS_LEAF_BIT, EXTENSION_BIT */
/*
This code was ported from Python to Javascript based on reference code from:
https://github.com/pytries/DAWG-Python/

The original code was licensed under MIT license:

    Copyright (c) Mikhail Korobov, 2012

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is furnished
    to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
    A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const PRECISION_MASK = 0xFFFFFFFF;
const OFFSET_MAX = (/* unused pure expression or super */ null && (1 << 21));
const IS_LEAF_BIT = 1 << 31;
const HAS_LEAF_BIT = 1 << 8;
const EXTENSION_BIT = 1 << 9;
/**
 * Check if a unit has a leaf as a child or not.
 */
function has_leaf(base, _mask = HAS_LEAF_BIT) {
    return (base & _mask) ? true : false;
}
/**
 * Check if a unit corresponds to a leaf or not.
 */
function value(base, _mask = ~IS_LEAF_BIT & PRECISION_MASK) {
    return base & _mask;
}
/**
 * Read a label with a leaf flag from a non-leaf unit.
 */
function label(base, _mask = IS_LEAF_BIT | 0xFF) {
    return base & _mask;
}
/**
 * Read an offset to child units from a non-leaf unit.
 */
function offset(base) {
    return ((base >> 10) << ((base & EXTENSION_BIT) >> 6)) & PRECISION_MASK;
}


/***/ }),

/***/ 765:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "XB": () => (/* binding */ Completer),
/* harmony export */   "Xy": () => (/* binding */ Dictionary),
/* harmony export */   "fD": () => (/* binding */ Guide)
/* harmony export */ });
/* harmony import */ var _units__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(163);
/*
This code was ported from Python to Javascript based on reference code from:
https://github.com/pytries/DAWG-Python/

The original code was licensed under MIT license:

    Copyright (c) Mikhail Korobov, 2012

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is furnished
    to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR
    A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Dictionary class for retrieval and binary I/O.
 */
class Dictionary {
    constructor() {
        this._units = null;
        this.ROOT = 0;
    }
    /**
     * Checks if a given index is related to the end of a key.
     */
    has_value(index) {
        if (this._units == null) {
            return false;
        }
        return _units__WEBPACK_IMPORTED_MODULE_0__/* .has_leaf */ .yI(this._units[index]);
    }
    /**
     * Gets a value from a given index.
     */
    value(index) {
        if (this._units == null) {
            throw "Error: _units is null!";
        }
        const offset = _units__WEBPACK_IMPORTED_MODULE_0__/* .offset */ .cv(this._units[index]);
        const value_index = (index ^ offset) & _units__WEBPACK_IMPORTED_MODULE_0__/* .PRECISION_MASK */ .Wf;
        return _units__WEBPACK_IMPORTED_MODULE_0__/* .value */ .S3(this._units[value_index]);
    }
    /**
     * Reads a dictionary from an input stream.
     */
    read(raw_buffer) {
        let view = new DataView(raw_buffer);
        let base_size = view.getUint32(0, true);
        this._units = new Uint32Array(raw_buffer, 4, base_size);
    }
    /**
     * Exact matching.
     */
    contains(key) {
        const index = this.follow_bytes(key, this.ROOT);
        if (index === null) {
            return false;
        }
        return this.has_value(index);
    }
    /**
     * Exact matching (returns value)
     */
    find(key) {
        const index = this.follow_bytes(key, this.ROOT);
        if (index === null) {
            return -1;
        }
        if (!this.has_value(index)) {
            return -1;
        }
        return this.value(index);
    }
    /**
     * Follows a transition
     */
    follow_char(label, index) {
        if (this._units == null) {
            throw "Error: _units is null!";
        }
        const offset = _units__WEBPACK_IMPORTED_MODULE_0__/* .offset */ .cv(this._units[index]);
        const next_index = (index ^ offset ^ label) & _units__WEBPACK_IMPORTED_MODULE_0__/* .PRECISION_MASK */ .Wf;
        if (_units__WEBPACK_IMPORTED_MODULE_0__/* .label */ .PS(this._units[next_index]) != label) {
            return null;
        }
        return next_index;
    }
    /**
     * Follows transitions.
     */
    follow_bytes(s, index) {
        let i = index;
        for (let ch of s) {
            i = this.follow_char(ch, i);
            if (i === null) {
                return null;
            }
        }
        return i;
    }
}
class Guide {
    constructor() {
        this._units = null;
        this.ROOT = 0;
    }
    child(index) {
        if (this._units == null) {
            throw "Can't use Guide before reading into it.";
        }
        return this._units[index * 2];
    }
    sibling(index) {
        if (this._units == null) {
            throw "Can't use Guide before reading into it.";
        }
        return this._units[index * 2 + 1];
    }
    read(raw_buffer) {
        let view = new DataView(raw_buffer);
        let dict_size = view.getUint32(0, true);
        let guide_offset = 4 + (dict_size * 4);
        let base_size = view.getUint32(guide_offset, true);
        this._units = new Uint8Array(raw_buffer, guide_offset + 4, base_size * 2);
    }
    size() {
        if (this._units == null) {
            throw "Can't use Guide before reading into it.";
        }
        return this._units.length;
    }
}
class Completer {
    constructor(dic, guide) {
        this._dic = dic;
        this._guide = guide;
        this._last_index = -1;
        this._index_stack = [];
        this._parent_index = -1;
        this._sib_index = null;
        this.key = [];
    }
    value() {
        return this._dic.value(this._last_index);
    }
    start(index, prefix) {
        this.key = [...prefix];
        if (this._guide.size()) {
            this._index_stack = [index];
            this._last_index = this._dic.ROOT;
        }
        else {
            this._index_stack = [];
        }
    }
    start_edges(index, prefix) {
        this.key = [...prefix];
        this._parent_index = index;
        this._sib_index = null;
        if (this._guide.size() > 0) {
            let child_label = this._guide.child(index);
            if (child_label) {
                let next_index = this._dic.follow_char(child_label, index);
                if (index != null) {
                    this._sib_index = next_index;
                    this.key.push(child_label);
                    return true;
                }
            }
        }
        return false;
    }
    next_edge() {
        if (this._sib_index == null) {
            return false;
        }
        let sibling_label = this._guide.sibling(this._sib_index);
        this._sib_index = this._dic.follow_char(sibling_label, this._parent_index);
        if (this._sib_index == null) {
            return false;
        }
        this.key.pop();
        this.key.push(sibling_label);
        return true;
    }
    /**
     * Gets the next key
     */
    next() {
        if (this._index_stack.length === 0) {
            return false;
        }
        let index = this._index_stack[this._index_stack.length - 1];
        if (this._last_index != this._dic.ROOT) {
            const child_label = this._guide.child(index);
            if (child_label) {
                // Follows a transition to the first child.
                index = this._follow(child_label, index);
                if (index === null) {
                    return false;
                }
            }
            else {
                while (true) {
                    let sibling_label = this._guide.sibling(index);
                    // Moves to the previous node.
                    if (this.key.length > 0) {
                        this.key.pop();
                    }
                    this._index_stack.pop();
                    if (this._index_stack.length === 0) {
                        return false;
                    }
                    index = this._index_stack[this._index_stack.length - 1];
                    if (sibling_label) {
                        // Follows a transition to the next sibling.
                        index = this._follow(sibling_label, index);
                        if (index === null) {
                            return false;
                        }
                        break;
                    }
                }
            }
        }
        return this._find_terminal(index);
    }
    _follow(label, index) {
        const next_index = this._dic.follow_char(label, index);
        if (next_index === null) {
            return null;
        }
        this.key.push(label);
        this._index_stack.push(next_index);
        return next_index;
    }
    _find_terminal(index) {
        while (!this._dic.has_value(index)) {
            let label = this._guide.child(index);
            let i = this._dic.follow_char(label, index);
            if (index === null) {
                return false;
            }
            index = i;
            this.key.push(label);
            this._index_stack.push(index);
        }
        this._last_index = index;
        return true;
    }
}


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(701), __webpack_exec__(163), __webpack_exec__(765));
/******/ }
]);