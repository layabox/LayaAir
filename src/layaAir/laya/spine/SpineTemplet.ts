import { ILaya } from "../../ILaya";
import { Resource } from "../resource/Resource";
import { Texture } from "../resource/Texture";
import { URL } from "../net/URL";
import { ILoadURL } from "../net/Loader";
import { Event } from "../events/Event";
import { SpineTexture } from "./SpineTexture";
import { IBatchProgress } from "../net/BatchProgress";

export enum SpineVersion {
    v3_7,
    v3_8,
    v4_0,
}

/**
 * Spine动画模板基类
 */
export class SpineTemplet extends Resource {
    public static RuntimeVersion: SpineVersion = SpineVersion.v3_8;

    public skeletonData: spine.SkeletonData;

    private _textures: Record<string, SpineTexture>;
    private _basePath: string;
    private _ns: any;

    constructor() {
        super();

        this._textures = {};
    }

    get ns(): typeof spine {
        return this._ns;
    }

    get basePath(): string {
        return this._basePath;
    }

    getTexture(name: string): SpineTexture {
        return this._textures[name];
    }

    _parse(desc: string | ArrayBuffer, atlasText: string, createURL: string, progress?: IBatchProgress): Promise<void> {
        this._basePath = URL.getPath(createURL);
        let version = this.getRuntimeVersion(desc);
        let parseAtlas;
        if (version == SpineVersion.v4_0)
            parseAtlas = this.parseAtlas4;
        else
            parseAtlas = this.parseAtlas3;

        return parseAtlas.call(this, atlasText, progress).then((atlas: any) => {
            let atlasLoader = new this._ns.AtlasAttachmentLoader(atlas);
            if (desc instanceof ArrayBuffer) {
                let skeletonBinary = new this._ns.SkeletonBinary(atlasLoader);
                this.skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(desc));
            } else {
                let skeletonJson = new this._ns.SkeletonJson(atlasLoader);
                this.skeletonData = skeletonJson.readSkeletonData(desc);
            }
            this.event(Event.LOADED);
        });
    }

    private getRuntimeVersion(desc: string | ArrayBuffer): SpineVersion {
        this._ns = spine;
        return SpineTemplet.RuntimeVersion;
    }

    private parseAtlas3(atlasText: string, progress?: IBatchProgress): Promise<spine.TextureAtlas> {
        let atlasPages: Array<ILoadURL> = [];
        new this._ns.TextureAtlas(atlasText, (path: string) => {
            atlasPages.push({ url: this._basePath + path });
            return new SpineTexture(null);
        });
        return ILaya.loader.load(atlasPages, null, progress?.createCallback()).then((res: Array<Texture>) => {
            let i = 0;
            let atlas = new this._ns.TextureAtlas(atlasText, (path: string) => {
                let tex = res[i++];
                if (tex)
                    tex._addReference();
                let spineTex = new SpineTexture(tex);
                this._textures[path] = spineTex;
                return spineTex;
            });
            return atlas;
        });
    }

    private parseAtlas4(atlasText: string, progress?: IBatchProgress): Promise<spine.TextureAtlas> {
        let atlas = new this._ns.TextureAtlas(atlasText);
        return ILaya.loader.load(atlas.pages.map(
            (page: spine.TextureAtlasPage) => { return <ILoadURL>{ url: this._basePath + page.name, propertyParams: { premultiplyAlpha: (<any>page).pma } } }),
            null, progress?.createCallback())
            .then((res: Array<Texture>) => {
                let i = 0;
                for (let page of atlas.pages) {
                    let tex = res[i++];
                    if (tex)
                        tex._addReference();
                    let spineTex = new SpineTexture(tex);
                    this._textures[page.name] = spineTex;
                    page.setTexture(spineTex);
                }

                return atlas;
            });
    }

    /**
     * 通过索引得动画名称
     * @param	index
     * @return
     */
    getAniNameByIndex(index: number): string {
        let tAni: any = this.skeletonData.animations[index];
        if (tAni) return tAni.name;
        return null;
    }

    /**
     * 通过皮肤名字得到皮肤索引
     * @param	skinName 皮肤名称
     * @return
     */
    getSkinIndexByName(skinName: string): number {
        let skins = this.skeletonData.skins;
        let tSkinData: spine.Skin;
        for (let i: number = 0, n: number = skins.length; i < n; i++) {
            tSkinData = skins[i];
            if (tSkinData.name == skinName) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 释放纹理
     * @override
     */
    protected _disposeResource(): void {
        for (let k in this._textures) {
            this._textures[k].realTexture?._removeReference();
        }
    }
}
