import { SpineGLTexture } from "./SpineGLTexture";

export class SpineAssetManager extends spine.AssetManager {
    constructor (pathPrefix: string = "", downloader: any, textureDic: any) {
        super((image: any /**Texture | Texture2D*/, path: string) => {
            let texture = textureDic[path] = new SpineGLTexture(image.bitmap);
            return texture;
            // @ts-ignore
        }, pathPrefix, downloader);
    }
}