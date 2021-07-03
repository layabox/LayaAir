/**
 * 纹理寻址模式。
 */
export enum WarpMode {
    /** 循环平铺。*/
    Repeat = 0,
    /** 超过UV边界后采用最后一个像素。*/
    Clamp = 1
}