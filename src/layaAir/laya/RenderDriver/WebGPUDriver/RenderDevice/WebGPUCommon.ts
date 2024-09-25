export type OffsetAndSize = { offset: number, size: number };
export type NameAndType = { name: string; type: string; set: number };
export type NameStringMap = Record<string, string>;
export type NameNumberMap = Record<string, number>;
export type NameBooleanMap = Record<string, boolean>;

// export type TypedArray =
//     | Int8Array
//     | Uint8Array
//     | Int16Array
//     | Uint16Array
//     | Int32Array
//     | Uint32Array
//     | Float32Array
//     | Float64Array;

// export type TypedArrayConstructor =
//     | Int8ArrayConstructor
//     | Uint8ArrayConstructor
//     | Int16ArrayConstructor
//     | Uint16ArrayConstructor
//     | Int32ArrayConstructor
//     | Uint32ArrayConstructor
//     | Float32ArrayConstructor
//     | Float64ArrayConstructor;

// /**
//  * 向上圆整到align的整数倍
//  * @param n 
//  * @param align 
//  */
// export function roundUp(n: number, align: number) {
//     return (((n + align - 1) / align) | 0) * align;
// }

// /**
//  * 向下圆整到align的整数倍
//  * @param n 
//  * @param align 
//  */
// export function roundDown(n: number, align: number) {
//     const res = (((n + align - 1) / align) | 0) * align;
//     return res > n ? res - align : res;
// }