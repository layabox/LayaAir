import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * ...
 * @author
 */
export class TextureGenerator {
    constructor() {
    }
    static lightAttenTexture(x, y, maxX, maxY, index, data) {
        var sqrRange = x / maxX;
        var atten = 1.0 / (1.0 + 25.0 * sqrRange);
        if (sqrRange >= 0.64) {
            if (sqrRange > 1.0) {
                atten = 0;
            }
            else {
                atten *= 1 - (sqrRange - 0.64) / (1 - 0.64);
            }
        }
        data[index] = Math.floor(atten * 255.0 + 0.5);
    }
    static haloTexture(x, y, maxX, maxY, index, data) {
        maxX >>= 1;
        maxY >>= 1;
        var xFac = (x - maxX) / maxX;
        var yFac = (y - maxY) / maxY;
        var sqrRange = xFac * xFac + yFac * yFac;
        if (sqrRange > 1.0) {
            sqrRange = 1.0;
        }
        data[index] = Math.floor((1.0 - sqrRange) * 255.0 + 0.5);
    }
    static _generateTexture2D(texture, textureWidth, textureHeight, func) {
        var index = 0;
        var size = 0;
        switch (texture.format) {
            case BaseTexture.FORMAT_R8G8B8:
                size = 3;
                break;
            case BaseTexture.FORMAT_R8G8B8A8:
                size = 4;
                break;
            case BaseTexture.FORMAT_ALPHA8:
                size = 1;
                break;
            default:
                throw "GeneratedTexture._generateTexture: unkonw texture format.";
        }
        var data = new Uint8Array(textureWidth * textureHeight * size);
        for (var y = 0; y < textureHeight; y++) {
            for (var x = 0; x < textureWidth; x++) {
                func(x, y, textureWidth, textureHeight, index, data);
                index += size;
            }
        }
        texture.setPixels(data);
    }
}
