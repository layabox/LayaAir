import { Texture2D } from "../../resource/Texture2D";
/**
 * ...
 * @author
 */
export declare class TextureGenerator {
    constructor();
    static lightAttenTexture(x: number, y: number, maxX: number, maxY: number, index: number, data: Uint8Array): void;
    static haloTexture(x: number, y: number, maxX: number, maxY: number, index: number, data: Uint8Array): void;
    static _generateTexture2D(texture: Texture2D, textureWidth: number, textureHeight: number, func: Function): void;
}
