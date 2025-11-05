import { Laya } from "../../../../../Laya";
import { ILoadTask, ILoadURL, Loader } from "../../../../net/Loader";
import { URL } from "../../../../net/URL";
import { TextureFormat } from "../../../../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../../../../resource/Texture2D";
import { ISpineTempletParser } from "../../../interface/ISpineParse";
import { SpineConst } from "../../../SpineConst";
import { SpineTemplet } from "../../../SpineTemplet";
import { SkeletonOptimise } from "../../base/optimize/SkeletonOptimise";
import { SpineTexture } from "../../SpineTexture";


const _premultipliedAlpha = false;
const _srgb = true;

export class WebSpineTempletParser implements ISpineTempletParser {

    private _atlas: spine.TextureAtlas;
    private _version: number = 3.8;

    parse(data: string | ArrayBuffer, textures: Record<string, Texture2D>, premultipliedAlpha = true): SpineTemplet {
        
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

        let offset = new spine.Vector2;
        let size = new spine.Vector2;

        let skeletonOptimise = new SkeletonOptimise();
        
        let skeleton = new spine.Skeleton(skeletonData);
        // skeleton.setToSetupPose();
        // skeleton.updateWorldTransform(0);
        skeleton.getBounds(offset, size);

        if (
            size.x !== Infinity 
            && size.y !== Infinity
            && offset.x !== Infinity
            && offset.y !== Infinity
        ) {
            templet.width = size.x;
            templet.height = size.y;
            templet.offsetX = offset.x + size.x;
            templet.offsetY = -(offset.y + size.y);
        }else{
            let rootBone = skeleton.getRootBone();
            templet.width = skeletonData.width || 0;
            templet.height = skeletonData.height || 0;
            templet.offsetX = (skeletonData.x || 0) + templet.width + rootBone.x;
            templet.offsetY = -((skeletonData.y || 0) + templet.height - rootBone.y);
        }

        if (this._version >= 4.1) {
            templet.needSlot = true;
        }

        templet._textures = textures;
        templet._premultipliedAlpha = premultipliedAlpha;
        templet.hasPhysics = premultipliedAlpha && skeletonData.physicsConstraints.length > 0;
        skeletonOptimise.canCache = SpineConst.cacheSwitch && !templet.hasPhysics;
        skeletonOptimise.checkMainAttach(skeleton, skeletonData);
        templet.optimize = skeletonOptimise;
        return templet;
    }

    collectTextures( atlasText: string, task: ILoadTask) : ILoadURL[] {
        this._version = parseFloat(SpineConst.VERSION);
        // debugger
        if (this._version >= 4.0)
            return this.parseAtlas4(atlasText, task);
        else
            return this.parseAtlas3(atlasText, task);
    }


    create(desc: string | ArrayBuffer , textures:Texture2D[]) : SpineTemplet {
        if (this._version >= 4.0)
            return this._initTemplet4(desc , textures);
        else
            return this._initTemplet3(desc , textures);
    }

    private _initTemplet3(desc: string | ArrayBuffer , textures:Texture2D[]): SpineTemplet {
        let textureMap: Record<string, Texture2D> = {}
        let atlas = this._atlas;
        let premultipliedAlpha = true;

        for (var i = 0; i < textures.length; i++) {
            let tex = textures[i];
            if (tex) tex._addReference();
            let pages = atlas.pages;
            // 默认长度 = 1
            let page = pages[i];
            premultipliedAlpha = page.pma || (tex && tex._premultiplyAlpha && premultipliedAlpha);

            //@ts-ignore
            page.texture.realTexture = tex;
            page.texture.setFilters(page.minFilter, page.magFilter);
            page.texture.setWraps(page.uWrap, page.vWrap);
            page.width = page.texture.getImage().width;
            page.height = page.texture.getImage().height;
            textureMap[page.name] = tex;
        }


        let regions = atlas.regions;
        for (const region of regions) {
            let page = region.page;
            region.u = region.x / page.width;
            region.v = region.y / page.height;
            //@ts-ignore
            if (region.rotate) {
                region.u2 = (region.x + region.height) / page.width;
                region.v2 = (region.y + region.width) / page.height;
            }
            else {
                region.u2 = (region.x + region.width) / page.width;
                region.v2 = (region.y + region.height) / page.height;
            }
        }

        return this.parse(desc , textureMap, premultipliedAlpha);
    }

    private parseAtlas3( atlasText: string, task: ILoadTask):ILoadURL[] {
        let atlasPages: Array<ILoadURL> = [];
        let basePath = URL.getPath(task.url);
        //@ts-ignore
        let atlas = new spine.TextureAtlas(atlasText, (path: string) => {
            let url = basePath + path;
            atlasPages.push({
                url, type: Loader.TEXTURE2D,
                propertyParams: {
                    premultiplyAlpha: _premultipliedAlpha
                },
                constructParams: [0, 0, TextureFormat.R8G8B8A8, false, false, _srgb, _premultipliedAlpha]
            });
            return new SpineTexture(null);
        });
        this._atlas = atlas;
        return atlasPages;
    }

    private _initTemplet4(desc: string | ArrayBuffer , textures:Texture2D[]): SpineTemplet {
        let textureMap: Record<string, Texture2D> = {}
        let pages = this._atlas.pages;
        let premultipliedAlpha = true;
        for (let i = 0, len = textures.length; i < len; i++) {
            let tex = textures[i];
            if (tex) tex._addReference();
            let page = pages[i];

            premultipliedAlpha = page.pma || (tex._premultiplyAlpha && premultipliedAlpha);
            textureMap[page.name] = tex;
            //@ts-ignore
            page.setTexture(new SpineTexture(tex));
        }

        // templet._parse(desc, atlas, textures, premultipliedAlpha);
        return this.parse(desc , textureMap , premultipliedAlpha);
    }

    private parseAtlas4( atlasText: string, task: ILoadTask):ILoadURL[] {
        let atlas = new spine.TextureAtlas(atlasText);
        let basePath = URL.getPath(task.url);
        this._atlas = atlas;
        return atlas.pages.map((page: spine.TextureAtlasPage) => {
            return {
                url: basePath + page.name,
                type: Loader.TEXTURE2D,
                propertyParams: {
                    premultiplyAlpha: _premultipliedAlpha
                },
                constructParams: [0, 0, TextureFormat.R8G8B8A8, false, false, _srgb, _premultipliedAlpha]
            }
        });
    }

    destroy(): void {
    }
}