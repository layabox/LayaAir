import { Sprite } from "../display/Sprite";
import { Context } from "../resource/Context";
/**
 * @private
 * 快速节点命令执行器
 * 多个指令组合才有意义，单个指令没必要在下面加
 */
export declare class LayaGLQuickRunner {
    static map: any;
    private static curMat;
    static __init__(): void;
    static transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void;
    static alpha_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void;
    static alpha_transform_drawTexture(sprite: Sprite, context: Context, x: number, y: number): void;
    static alpha_transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void;
    static alpha_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void;
    static transform_drawLayaGL(sprite: Sprite, context: Context, x: number, y: number): void;
    static transform_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void;
    static drawLayaGL_drawNodes(sprite: Sprite, context: Context, x: number, y: number): void;
}
