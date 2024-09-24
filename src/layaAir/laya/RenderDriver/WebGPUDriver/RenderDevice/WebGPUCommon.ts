export type OffsetAndSize = { offset: number, size: number };
export type NameAndType = { name: string; type: string; set: number };
export type NameStringMap = Record<string, string>;
export type NameNumberMap = Record<string, number>;
export type NameBooleanMap = Record<string, boolean>;

/**
 * 向上圆整到align的整数倍
 * @param n 
 * @param align 
 */
export function roundUp(n: number, align: number) {
    return (((n + align - 1) / align) | 0) * align;
}

/**
 * 向下圆整到align的整数倍
 * @param n 
 * @param align 
 */
export function roundDown(n: number, align: number) {
    const res = (((n + align - 1) / align) | 0) * align;
    return res > n ? res - align : res;
}

/**
 * 是否是TypedArray
 * @param arr 
 */
export const isTypedArray = (arr: any) =>
    arr && typeof arr.length === 'number' && arr.buffer instanceof ArrayBuffer && typeof arr.byteLength === 'number';