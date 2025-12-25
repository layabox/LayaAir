import { ILoadTask, ILoadURL } from "../../net/Loader";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { ISpineTempletParser } from "../interface/ISpineParse";
import { SpineTemplet } from "../SpineTemplet";
import { Material } from "../../resource/Material";
import { SpineShaderInit } from "../shader/SpineShaderInit";
import { NativeSkeletonOptimise } from "./NativeSkeletonOptimise";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";

const PREMULTIPLIED_ALPHA = true;
const SPLIT_REGEX = /\r?\n/;
const PMA_REGEX = /^pma:\s*(true|false)$/i;

/**
 * @en Native Spine Templet Parser for parsing Spine skeleton and atlas data.
 * @zh Native Spine 模板解析器，用于解析 Spine 骨骼和 atlas 数据。
 */
export class NativeSpineTempletParser implements ISpineTempletParser {
    private _nativeParser: any; // conchNativeSpineTempletParser from C++
    private _cachedTextureUrls: string[] | null = null; // Cache parsed texture URLs to avoid re-parsing
    private _premultipliedAlpha: boolean = PREMULTIPLIED_ALPHA;
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
        // 在 TS 端解析 atlas 文本，提取贴图文件名和 pma 信息
        const lines = atlasText.split(SPLIT_REGEX);
        const textureInfos: Array<{ path: string; pma: boolean }> = [];
        const urls: string[] = [];
        let currentPma: boolean = true; // 默认值，如果 atlas 中没有指定则使用 true
        
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (!trimmed)
                continue;
            
            // 检查 pma 信息（可能在 texture 文件名之前）
            const pmaMatch = trimmed.match(PMA_REGEX);
            if (pmaMatch) {
                currentPma = pmaMatch[1].toLowerCase() === "true";
                continue;
            }
            
            // 检查是否是纹理文件名
            if (trimmed.indexOf(".png") !== -1 || trimmed.indexOf(".jpg") !== -1 || 
                trimmed.indexOf(".jpeg") !== -1 || trimmed.indexOf(".webp") !== -1) {
                // 与原生实现类似，只提取文件名部分
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
                // 重置 pma 为默认值，为下一个 texture 做准备
                currentPma = true;
            }
        }

        // Cache the parsed texture URLs for reuse in create()
        this._cachedTextureUrls = urls;

        const basePath = task.url.substring(0, task.url.lastIndexOf("/") + 1);
        
        return textureInfos.map((info: { path: string; pma: boolean }) => ({
            url: basePath + info.path,
            type: "TEXTURE2D",
            propertyParams: {
                premultiplyAlpha: info.pma
            },
            constructParams: [0, 0, TextureFormat.R8G8B8A8, false, false, true, true]
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

        // Add texture size info to native parser before parsing
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

        // Create rtSkeletonOptimize on the native side
        // @ts-ignore
        const rtSkeletonOptimize = new conchSkeletonOptimise();

        // Create shared buffer for parse result [x, y, width, height, offsetX, offsetY]
        const parseResultBuffer = new Float32Array(6);

        // Call parse with shared buffer output
        let parseSuccess: number;
        if (isBinary) {
            parseSuccess = this._nativeParser.parseBinary(
                rtSkeletonOptimize,
                desc as ArrayBuffer,
                this._atlasTextContent,
                parseResultBuffer // Output buffer
            );
        } else {
            parseSuccess = this._nativeParser.parse(
                rtSkeletonOptimize,
                desc as string,
                this._atlasTextContent,
                parseResultBuffer // Output buffer
            );
        }

        if (!parseSuccess) {
            throw new Error("Failed to parse Spine skeleton data");
        }

        // Read parse results from shared buffer
        const x = parseResultBuffer[0];
        const y = parseResultBuffer[1];
        const width = parseResultBuffer[2];
        const height = parseResultBuffer[3];
        const offsetX = parseResultBuffer[4];
        const offsetY = parseResultBuffer[5];

        // Wrap native optimize in TypeScript class for lightweight property access
        const wrappedOptimise = new NativeSkeletonOptimise(rtSkeletonOptimize);

        // Create SpineTemplet in JS side
        const templet = new SpineTemplet();
        templet.optimize = wrappedOptimise;
        templet._textures = {}; // textureMap is now managed on JS side
        templet.x = x;
        templet.y = y;
        templet.width = width;
        templet.height = height;
        templet.offsetX = offsetX;
        templet.offsetY = offsetY;

        templet._premultipliedAlpha = this._premultipliedAlpha;

        // Create material templates for each texture (2D + 3D per texture)
        if (textureUrls.length > 0 && textures.length > 0) {
            const minLength = Math.min(textureUrls.length, textures.length);
            for (let i = 0; i < minLength; i++) {
                const textureUrl = textureUrls[i];
                const texture = textures[i];
                if (texture) {
                    // Create 2D material template
                    const template2D = new Material();
                    template2D.setShaderName("SpineStandard");
                    SpineShaderInit.initSpineMaterial(template2D);
                    const shaderData2D = template2D.shaderData;
                    shaderData2D.setTexture(SpineShaderInit.SpineTexture, texture);

                    // Set texture-related defines based on gammaCorrection
                    if (texture.gammaCorrection != 1) {
                        shaderData2D.addDefine(ShaderDefines2D.GAMMATEXTURE);
                    }

                    // Create 3D material template
                    const template3D = new Material();
                    template3D.setShaderName("Spine3D");
                    SpineShaderInit.initSpineMaterial(template3D);
                    const shaderData3D = template3D.shaderData;
                    shaderData3D.setTexture(SpineShaderInit.SpineTexture, texture);

                    // Set texture-related defines based on gammaCorrection
                    if (texture.gammaCorrection != 1) {
                        shaderData3D.addDefine(ShaderDefines2D.GAMMATEXTURE);
                    }

                    // Set material templates to native side with texture URL and ID
                    rtSkeletonOptimize.setMaterialTemplate(
                        false, // is3D = false for 2D
                        textureUrl,
                        texture._id,
                        (shaderData2D as any)._nativeObj,
                        (template2D.shader.getSubShaderAt(0) as any).moduleData._nativeObj
                    );
                    rtSkeletonOptimize.setMaterialTemplate(
                        true, // is3D = true for 3D
                        textureUrl,
                        texture._id,
                        (shaderData3D as any)._nativeObj,
                        (template3D.shader.getSubShaderAt(0) as any).moduleData._nativeObj
                    );
                }
            }
        }

        // Initialize all VertexDeclaration and set to nativeOptimize
        const vertexFlags = [
            "UV,COLOR,POSITION",
            "UV,COLOR,POSITION,COLOR2",
            "UV,COLOR,POSITION,BONE",
            "UV,COLOR,POSITION,BONE,COLOR2"
        ];

        for (const vertexFlag of vertexFlags) {
            const vertexDeclaration = SpineShaderInit.getVertexDeclaration(vertexFlag);
            if (vertexDeclaration && vertexDeclaration._shaderValues) {
                for (const shaderLocation of Object.keys(vertexDeclaration._shaderValues)) {
                    let location = parseInt(shaderLocation);
                    const vertexStateContext = vertexDeclaration._shaderValues[location];
                    if (vertexStateContext) {
                        rtSkeletonOptimize.setVertexDeclaration(vertexFlag, location, vertexStateContext);
                    }
                }
            }
        }

        return templet;
    }


    /**
     * @en Destroy the parser.
     * @zh 销毁解析器。
     */
    destroy(): void {
        // Cleanup if needed
    }
}

