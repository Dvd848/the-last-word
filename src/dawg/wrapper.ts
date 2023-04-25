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
import * as units from './units';

/**
 * Dictionary class for retrieval and binary I/O.
 */
export class Dictionary 
{
    private _units : Uint32Array | null;
    public ROOT : number;

    constructor() 
    {
        this._units = null;
        this.ROOT = 0;
    }

    /**
     * Checks if a given index is related to the end of a key.
     */
    has_value(index: number) : boolean
    {
        if ( this._units == null )
        {
            return false;
        }
        return units.has_leaf(this._units[index]);
    }
    
    /**
     * Gets a value from a given index.
     */
    value(index: number) : number
    {
        if (this._units == null)
        {
            throw "Error: _units is null!";
        }

        const offset = units.offset(this._units[index]);
        const value_index = (index ^ offset) & units.PRECISION_MASK;
        return units.value(this._units[value_index]);
    }

    /**
     * Reads a dictionary from an input stream.
     */
    read(raw_buffer: ArrayBuffer) : void
    {
        let view = new DataView(raw_buffer);
        let base_size = view.getUint32(0, true);
        this._units = new Uint32Array(raw_buffer, 4, base_size);
    }

    /**
     * Exact matching.
     */
    contains(key: Uint8Array) : boolean
    {
        const index = this.follow_bytes(key, this.ROOT);
        if (index === null) 
        {
            return false;
        }
        return this.has_value(index);
    }

    /**
     * Exact matching (returns value)
     */
    find(key: Uint8Array) : number
    {
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
    follow_char(label : number, index : number) : number | null
    {
        if (this._units == null)
        {
            throw "Error: _units is null!";
        }

        const offset = units.offset(this._units[index]);
        const next_index = (index ^ offset ^ label) & units.PRECISION_MASK;

        if (units.label(this._units[next_index]) != label) {
            return null;
        }

        return next_index;
    }

    /**
     * Follows transitions.
     */
    follow_bytes(s: Uint8Array, index: number) : number | null
    {
        let i : number | null = index;
        for (let ch of s) {
            i = this.follow_char(ch, i)
            if (i === null) {
                return null;
            }
        }

        return i;
    }
}

export class Guide 
{

    private _units : Uint8Array | null;
    public ROOT : number;
    
    constructor() 
    {
        this._units = null;
        this.ROOT = 0;
    }

    child(index : number) : number
    {
        if (this._units == null)
        {
            throw "Can't use Guide before reading into it.";
        }
        return this._units[index*2];
    }

    sibling(index : number) : number
    {
        if (this._units == null)
        {
            throw "Can't use Guide before reading into it.";
        }

        return this._units[index*2 + 1];
    }

    read(raw_buffer : ArrayBuffer) : void
    {
        let view = new DataView(raw_buffer);
        let dict_size = view.getUint32(0, true);
        let guide_offset = 4 + (dict_size * 4);
        let base_size = view.getUint32(guide_offset, true);
        this._units = new Uint8Array(raw_buffer, guide_offset + 4, base_size * 2);
    }

    size() : number
    {
        if (this._units == null)
        {
            throw "Can't use Guide before reading into it.";
        }

        return this._units.length;
    }
}

export class Completer 
{
    private _dic : Dictionary;
    private _guide : Guide;
    private _last_index : number;
    private _index_stack : number[];
    private _parent_index : number;
    private _sib_index : number | null;
    public key : number[];
    
    constructor(dic: Dictionary, guide: Guide) 
    {
        this._dic = dic;
        this._guide = guide;
        this._last_index = -1;
        this._index_stack = [];
        this._parent_index = -1;
        this._sib_index = null;
        this.key = [];
    }

    value() : number
    {
        return this._dic.value(this._last_index)
    }

    start(index: number, prefix: Uint8Array) 
    {
        this.key = [...prefix];

        if (this._guide.size()) 
        {
            this._index_stack = [index];
            this._last_index = this._dic.ROOT;
        }
        else 
        {
            this._index_stack = [];
        }
    }

    start_edges(index: number, prefix: Uint8Array) : boolean
    {
        this.key = [...prefix];
        this._parent_index = index;
        this._sib_index = null;
        if (this._guide.size() > 0)
        {
            let child_label = this._guide.child(index);

            if (child_label)
            {
                let next_index = this._dic.follow_char(child_label, index);
                if (index != null)
                {
                    this._sib_index = next_index;
                    this.key.push(child_label);
                    return true;
                }
            }
        }
        return false;
    }

    next_edge() : boolean
    {
        if (this._sib_index == null)
        {
            return false;
        }

        let sibling_label = this._guide.sibling(this._sib_index);
        this._sib_index = this._dic.follow_char(sibling_label, this._parent_index);
        if (this._sib_index == null)
        {
            return false;
        }

        this.key.pop();
        this.key.push(sibling_label);
        return true;
    }

    /**
     * Gets the next key
     */
    next() : boolean
    {

        if (this._index_stack.length === 0) 
        {
            return false;
        }

        let index : number | null = this._index_stack[this._index_stack.length - 1];

        if (this._last_index != this._dic.ROOT) 
        {

            const child_label = this._guide.child(index);

            if (child_label) 
            {
                // Follows a transition to the first child.
                index = this._follow(child_label, index);
                if (index === null) 
                {
                    return false;
                }
            }
            else 
            {
                while (true) 
                {
                    let sibling_label = this._guide.sibling(index);
                    // Moves to the previous node.
                    if (this.key.length > 0) 
                    {
                        this.key.pop();
                    }

                    this._index_stack.pop();
                    if (this._index_stack.length === 0) 
                    {
                        return false;
                    }

                    index = this._index_stack[this._index_stack.length - 1];
                    if (sibling_label) 
                    {
                        // Follows a transition to the next sibling.
                        index = this._follow(sibling_label, index);
                        if (index === null) 
                        {
                            return false;
                        }
                        break;
                    }
                }
            }
        }

        return this._find_terminal(index);
    }

    _follow(label : number, index : number) : number | null
    {
        const next_index = this._dic.follow_char(label, index);
        if (next_index === null) {
            return null;
        }

        this.key.push(label);
        this._index_stack.push(next_index);
        return next_index;
    }

    _find_terminal(index : number) : boolean
    {
        while (!this._dic.has_value(index)) {
            let label = this._guide.child(index);

            let i : number | null = this._dic.follow_char(label, index);
            if (index === null) {
                return false;
            }
            index = i!;

            this.key.push(label);
            this._index_stack.push(index);
        }

        this._last_index = index;
        return true;
    }
}