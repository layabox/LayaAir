/**
 * WebGL mode.
 */
 export enum WebGLMode {
    /** Auto, use WebGL2.0 if support, or will fallback to WebGL1.0. */
    Auto = 0,
    /** WebGL2.0. */
    WebGL2 = 1,
    /** WebGL1.0, */
    WebGL1 = 2
}