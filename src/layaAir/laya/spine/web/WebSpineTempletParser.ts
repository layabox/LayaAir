import { Laya } from "../../../Laya";
import { ILoadTask, ILoadURL, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { ISpineTempletParser } from "../interface/ISpineParse";
import { SpineConst } from "../SpineConst";
import { SpineTemplet } from "../SpineTemplet";
import { SkeletonOptimise } from "./base/optimize/SkeletonOptimise";
import { SpineTexture } from "./SpineTexture";

export class WebSpineTempletParser implements ISpineTempletParser {
    private _atlas: spine.TextureAtlas;
    private _premultipliedAlpha: boolean = SpineConst.PREMULTIPLIED_ALPHA_DEFAULT;
    private _cachedAtlasText: string | null = null; // Cache atlas text for creating TextureAtlas in parse step
    private _basePath: string = "";

    parse(data: string | ArrayBuffer, textures: Record<string, Texture2D>): SpineTemplet {
        
        let templet = new SpineTemplet();
        
        let atlasLoader = new spine.AtlasAttachmentLoader(this._atlas);
        let skeletonData : spine.SkeletonData = null;
        if (data instanceof ArrayBuffer) {
            //@ts-ignore
            let skeletonBinary = new spine.SkeletonBinary(atlasLoader, false);
            skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(data));
        } else {
            //@ts-ignore
            let skeletonJson = new spine.SkeletonJson(atlasLoader, false);
            skeletonData = skeletonJson.readSkeletonData(data);
        }

        let skeletonOptimise = new SkeletonOptimise();
        
        let skeleton = new spine.Skeleton(skeletonData);

        templet._textures = textures;
        templet._premultipliedAlpha = this._premultipliedAlpha;
        skeletonOptimise.hasPhysics = this._premultipliedAlpha && skeletonData.physicsConstraints && skeletonData.physicsConstraints.length > 0;
        skeletonOptimise.canCache = SpineConst.cacheSwitch && !skeletonOptimise.hasPhysics;
        skeletonOptimise.checkMainAttach(skeleton, skeletonData);
        
        // 有效值
        if (
            skeletonData.x == undefined 
            || skeletonData.y == undefined
            || skeletonData.width == undefined
            || skeletonData.height == undefined
        ) {
            let bounds = skeletonOptimise._getBounds();
            templet.x = bounds.x;
            templet.y = bounds.y;
            templet.width = bounds.width;
            templet.height = bounds.height;
            templet.offsetX = bounds.x + bounds.width;
            templet.offsetY = -(bounds.y + bounds.height);
        }else{
            templet.x = skeletonData.x || 0;
            templet.y = skeletonData.y || 0;
            templet.width = skeletonData.width || 0;
            templet.height = skeletonData.height || 0;
            templet.offsetX = (skeletonData.x || 0) + templet.width;
            templet.offsetY = -((skeletonData.y || 0) + templet.height);
        }

        templet.optimize = skeletonOptimise;
        templet._parser = this;

        return templet;
    }

    collectTextures( atlasText: string, task: ILoadTask) : ILoadURL[] {
        const lines = atlasText.split(SpineConst.SPLIT_REGEX);
        const textureInfos: Array<{ path: string; pma: boolean }> = [];
        const urls: string[] = [];
        let currentPma: boolean = this._premultipliedAlpha;
        
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (!trimmed)
                continue;
            
            // 检查 pma 信息（可能在 texture 文件名之前）
            const pmaMatch = trimmed.match(SpineConst.PMA_REGEX);
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

        this._cachedAtlasText = atlasText;
        this._basePath = URL.getPath(task.url);
        
        return textureInfos.map((info: { path: string; pma: boolean }) => ({
            url: this._basePath + info.path,
            type: Loader.TEXTURE2D,
            propertyParams: {
                premultiplyAlpha: info.pma
            },
            constructParams: [0, 0, TextureFormat.R8G8B8A8, false, false, true, info.pma]
        }));
    }


    create(desc: string | ArrayBuffer , textures:Texture2D[]) : SpineTemplet {
        // 创建 atlas 对象（在 parse 步骤中创建，而不是在 collectTextures 中）
        const atlasTextContent = this._cachedAtlasText || "";
        if (SpineConst.VersionFirst >= 4) {
            // Spine 4.0+ 版本
            this._atlas = new spine.TextureAtlas(atlasTextContent);
        } else {
            // Spine 3.x 版本
            //@ts-ignore
            this._atlas = new spine.TextureAtlas(atlasTextContent, (path: string) => {
                return new SpineTexture(Laya.loader.getRes(this._basePath + path , Loader.TEXTURE2D));
            });
        }
        
        let textureMap: Record<string, Texture2D> = {}
        let currentPma = this._premultipliedAlpha;
        let atlas = this._atlas;
        for (var i = 0; i < textures.length; i++) {
            let tex = textures[i];
            if (tex) tex._addReference();
            let pages = atlas.pages;
            // 默认长度 = 1
            let page = pages[i];
            textureMap[page.name] = tex;

            currentPma = currentPma && tex._premultiplyAlpha;
            if (page.setTexture) {
                //@ts-ignore
                page.setTexture(new SpineTexture(tex));
            }
        }

        this._premultipliedAlpha = currentPma;
        
        return this.parse(desc , textureMap)
    }

    destroy(): void {
    }
}