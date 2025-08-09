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
export const PRECISION_MASK = 0xFFFFFFFF

export const OFFSET_MAX = 1 << 21
export const IS_LEAF_BIT = 1 << 31
export const HAS_LEAF_BIT = 1 << 8
export const EXTENSION_BIT = 1 << 9

/**
 * Check if a unit has a leaf as a child or not.
 */
export function has_leaf(base : number, _mask=HAS_LEAF_BIT) : boolean
{
    return (base & _mask) ? true : false;
}

/**
 * Check if a unit corresponds to a leaf or not.
 */
export function value(base : number, _mask=~IS_LEAF_BIT & PRECISION_MASK) : number
{
    return base & _mask;
}

/**
 * Read a label with a leaf flag from a non-leaf unit.
 */
export function label(base : number, _mask=IS_LEAF_BIT | 0xFF) : number
{
    return base & _mask;
}

/**
 * Read an offset to child units from a non-leaf unit.
 */
export function offset(base : number) : number
{
    return ((base >> 10) << ((base & EXTENSION_BIT) >> 6)) & PRECISION_MASK;
}