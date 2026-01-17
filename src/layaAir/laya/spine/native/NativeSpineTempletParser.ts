import { ILoadTask, ILoadURL } from "../../net/Loader";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { ISpineTempletParser } from "../interface/ISpineParse";
import { SpineTemplet } from "../SpineTemplet";
import { SpineShaderInit } from "../shader/SpineShaderInit";
import { NativeSkeletonOptimise } from "./NativeSkeletonOptimise";
import { SpineConst } from "../SpineConst";

/**
 * @en Native Spine Templet Parser for parsing Spine skeleton and atlas data.
 * @zh Native Spine 模板解析器，用于解析 Spine 骨骼和 atlas 数据。
 */
export class NativeSpineTempletParser implements ISpineTempletParser {
    private _nativeParser: any; // conchNativeSpineTempletParser from C++
    private _cachedTextureUrls: string[] | null = null; // Cache parsed texture URLs to avoid re-parsing
    private _premultipliedAlpha: boolean = SpineConst.PREMULTIPLIED_ALPHA_DEFAULT;
    private _atlasTextContent: string | null = null;

    constructor() {
        // @ts-ignore
        this._nativeParser = new conchNativeSpineTempletParser();
    }

    /**
     * @en Collect texture paths from atlas text.
     * @param atlasText Atlas text content.
     * @param task Load task.
     * @returns Array of load URLs.
     * @zh 从 atlas 文本收集纹理路径。
     */
    collectTextures(atlasText: string, task: ILoadTask): ILoadURL[] {
        this._atlasTextContent = atlasText;
        const lines = atlasText.split(SpineConst.SPLIT_REGEX);
        const textureInfos: Array<{ path: string; pma: boolean }> = [];
        const urls: string[] = [];
        let currentPma: boolean = true;
        
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (!trimmed)
                continue;
            
            const pmaMatch = trimmed.match(SpineConst.PMA_REGEX);
            if (pmaMatch) {
                currentPma = pmaMatch[1].toLowerCase() === "true";
                continue;
            }
            
            // 检查是否是纹理文件名
            if (trimmed.indexOf(".png") !== -1 || trimmed.indexOf(".jpg") !== -1 || 
                trimmed.indexOf(".jpeg") !== -1 || trimmed.indexOf(".webp") !== -1) {
                const lastSlash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
                const texturePath = lastSlash !== -1 
                    ? trimmed.substring(lastSlash + 1) 
                    : trimmed;
                
                textureInfos.push({
                    path: texturePath,
                    pma: currentPma
                });
                
                this._premultipliedAlpha = currentPma && this._premultipliedAlpha;
                urls.push(texturePath);
                currentPma = true;
            }
        }

        this._cachedTextureUrls = urls;

        const basePath = task.url.substring(0, task.url.lastIndexOf("/") + 1);
        
        return textureInfos.map((info: { path: string; pma: boolean }) => ({
            url: basePath + info.path,
            type: "TEXTURE2D",
            propertyParams: {
                premultiplyAlpha: info.pma
            },
            constructParams: [0, 0, TextureFormat.R8G8B8A8, false, false, true, info.pma]
        }));
    }

    /**
     * @en Parse skeleton data and create SpineTemplet.
     * @param desc Skeleton data (JSON string or ArrayBuffer).
     * @param textures Array of loaded texture objects.
     * @param atlasText Atlas text content (optional, for texture mapping).
     * @returns SpineTemplet instance.
     * @zh 解析骨骼数据并创建 SpineTemplet。
     */
    create(desc: string | ArrayBuffer, textures: Texture2D[]): SpineTemplet {
        const isBinary = desc instanceof ArrayBuffer;

        let textureUrls: string[] = this._cachedTextureUrls;

        if (textureUrls.length > 0 && textures.length > 0) {
            const minLength = Math.min(textureUrls.length, textures.length);
            for (let i = 0; i < minLength; i++) {
                const texture = textures[i];
                if (texture) {
                    this._nativeParser.addTextureSizeInfo(
                        textureUrls[i],
                        texture.width,
                        texture.height
                    );
                }
            }
        }

        const optimize = new NativeSkeletonOptimise();
        const rtSkeletonOptimize = optimize._getNativeOptimise();

        const templet = new SpineTemplet();
        templet.optimize = optimize;
        optimize._templet = templet;
        templet._textures = {};
        for (let i = 0; i < textureUrls.length; i++) {
            templet.setTexture(textureUrls[i], textures[i]);
        }

        const parseResultBuffer = new Float32Array(6);
        let parseSuccess: number;
        if (isBinary) {
            parseSuccess = this._nativeParser.parseBinary(
                rtSkeletonOptimize,
                desc as ArrayBuffer,
                this._atlasTextContent,
                parseResultBuffer
            );
        } else {
            parseSuccess = this._nativeParser.parse(
                rtSkeletonOptimize,
                JSON.stringify(desc),
                this._atlasTextContent,
                parseResultBuffer
            );
        }

        if (!parseSuccess) {
            console.error("Failed to parse Spine skeleton data");
            return null;
        }

        const x = parseResultBuffer[0];
        const y = parseResultBuffer[1];
        const width = parseResultBuffer[2];
        const height = parseResultBuffer[3];
        const offsetX = parseResultBuffer[4];
        const offsetY = parseResultBuffer[5];

        templet.x = x;
        templet.y = y;
        templet.width = width;
        templet.height = height;
        templet.offsetX = offsetX;
        templet.offsetY = offsetY;

        optimize.init();

        templet._premultipliedAlpha = this._premultipliedAlpha;
        // optimize.initMaterials(textureUrls, textures);
        templet._parser = this;

        return templet;
    }


    /**
     * @en Destroy the parser.
     * @zh 销毁解析器。
     */
    destroy(): void {
        this._nativeParser.destroy();
        this._nativeParser = null;
    }
}

