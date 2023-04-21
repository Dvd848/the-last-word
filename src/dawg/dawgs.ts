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

import { Completer, Dictionary, Guide } from '../dawg/wrapper';

export class CompletionDAWG 
{

    private dct : Dictionary | null;
    private guide : Guide | null;

    constructor() 
    {
        this.dct = null;
        this.guide = null;
    }

    keys(prefix = "") : string[]
    {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder("utf-8");
        const b_prefix = encoder.encode(prefix);
        const res : string[] = [];

        if ( (this.dct == null) || (this.guide == null) )
        {
            throw "Dictionary must be loaded first!";
        }

        const index = this.dct.follow_bytes(b_prefix, this.dct.ROOT);
        if (index === null) 
        {
            return res;
        }

        const completer = new Completer(this.dct, this.guide);
        completer.start(index, b_prefix);

        while (completer.next()) 
        {
            let key = decoder.decode(new Uint8Array(completer.key));
            res.push(key);
        }

        return res;
    }

    contains(key: string) : boolean
    {
        const encoder = new TextEncoder();
        const b_key = encoder.encode(key);

        if ( (this.dct == null) || (this.guide == null) )
        {
            throw "Dictionary must be loaded first!";
        }

        return this.dct.contains(b_key);
    }

    load(raw_bytes : ArrayBuffer) 
    {
        this.dct = new Dictionary();
        this.guide = new Guide();

        this.dct.read(raw_bytes);
        this.guide.read(raw_bytes);

        return this;
    }
}