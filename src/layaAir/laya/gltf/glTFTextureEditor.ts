import { Texture2D } from "../resource/Texture2D";
import { TextureFormat } from "../resource/TextureFormat";
import { LayaGL } from "../layagl/LayaGL";
import { WebGLContext } from "../webgl/WebGLContext";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Loader } from "../net/Loader";

/**
 * @internal
 * 将 glTF 材质Texture 转换为 layaPBR 材质Texture
 */
export class glTFTextureEditor {

    static PixelArrayToBase64(pixelArray: Uint8Array, width: number, height: number) {
        let clampedArray: Uint8ClampedArray = new Uint8ClampedArray(pixelArray);
        let imageData: ImageData = new ImageData(clampedArray, width, height);
        let canvas = new HTMLCanvas(true);
        let ctx = canvas.source.getContext("2d");
        canvas.source.width = width;
        canvas.source.height = height;
        ctx.putImageData(imageData, 0, 0);
        let base64 = canvas.source.toDataURL();
        return base64;
    }

    static GenerateTexture2DWithPixel(pixelArray: Uint8Array, width: number, height: number, format: TextureFormat, mipmap: boolean): Texture2D {
        let tex: Texture2D = new Texture2D(width, height, format, mipmap, true);

        tex.setPixels(pixelArray);

        if (mipmap) {
            let gl = LayaGL.instance;
            // @ts-ignore
            WebGLContext.bindTexture(gl, tex._glTextureType, tex._glTexture);
            // @ts-ignore
            gl.generateMipmap(tex._glTextureType);
            // @ts-ignore
            WebGLContext.bindTexture(gl, tex._glTextureType, null);
        }

        return tex;
    }

    static glTFOcclusionTrans(glTFOcclusion: Texture2D): Texture2D {
        /**
         * glTFMaterial.occlusionTexture.r ==>
         *  LayaPBR.occlusionTexture.g
         */
        let gltfTexPixels: Uint8Array = <Uint8Array>glTFOcclusion.getPixels();
        let layaTexPixels: Uint8Array = new Uint8Array(gltfTexPixels.length);

        let pixelCount: number = gltfTexPixels.length / 4;
        let r = 0, g = 1, b = 2, a = 3;
        for (let index = 0; index < pixelCount; index++) {
            let offset = index * 4;
            let occlusion: number = gltfTexPixels[offset + r];
            layaTexPixels[offset + g] = occlusion;
        }

        let layaTex: Texture2D = glTFTextureEditor.GenerateTexture2DWithPixel(layaTexPixels, glTFOcclusion.width, glTFOcclusion.height, TextureFormat.R8G8B8A8, glTFOcclusion.mipmap);

        return layaTex;
    }

    static glTFMetallicGlossTrans(glTFMetallicGloss: Texture2D, metallicFactor: number, roughnessFactor: number): Texture2D {
        /**
         * glTFMaterial.metallicGlossTexture.b => LayaPBR.metallicGlossTexture.r
         * 1.0 - metallicGlossTexture.g * pbrMetallicRoughness.roughnessFactor ==>
         *  LayaPBR.metallicGlossTexture.a
         */
        let gltfTexPixels: Uint8Array = <Uint8Array>glTFMetallicGloss.getPixels();
        let layaTexPixels: Uint8Array = new Uint8Array(gltfTexPixels.length);

        let pixelCount: number = glTFMetallicGloss.width * glTFMetallicGloss.height;
        let r = 0, g = 1, b = 2, a = 3;
        for (let index = 0; index < pixelCount; index++) {
            let offset: number = index * 4;
            let metallic: number = gltfTexPixels[offset + b] * metallicFactor;
            let smooth: number = 255 - (gltfTexPixels[offset + g] * roughnessFactor);
            layaTexPixels[offset + r] = metallic;
            layaTexPixels[offset + a] = smooth;
        }

        let layaTex: Texture2D = glTFTextureEditor.GenerateTexture2DWithPixel(layaTexPixels, glTFMetallicGloss.width, glTFMetallicGloss.height, TextureFormat.R8G8B8A8, glTFMetallicGloss.mipmap);

        // let base64url: string = glTFTextureEditor.PixelArrayToBase64(layaTexPixels, glTFMetallicGloss.width, glTFMetallicGloss.height);
        // layaTex._setCreateURL(base64url);
        // Loader.cacheRes(base64url, layaTex);

        return layaTex;
    }

}

