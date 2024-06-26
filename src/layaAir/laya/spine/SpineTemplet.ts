import { ILaya } from "../../ILaya";
import { Resource } from "../resource/Resource";
import { Texture } from "../resource/Texture";
import { URL } from "../net/URL";
import { ILoadURL } from "../net/Loader";
import { SpineTexture } from "./SpineTexture";
import { IBatchProgress } from "../net/BatchProgress";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { Spine2DRenderNode } from "./Spine2DRenderNode";
import { Material } from "../resource/Material";
import { SpineShaderInit } from "./material/SpineShaderInit";


/**
 * Spine动画模板基类
 */
export class SpineTemplet extends Resource {
    public static RuntimeVersion: string = "3.8";

    public skeletonData: spine.SkeletonData;

    materialMap: Map<string, Material> = new Map();

    private _textures: Record<string, SpineTexture>;
    private _basePath: string;
    private _ns: any;
    public needSlot: boolean;

    sketonOptimise: SketonOptimise;


    constructor() {
        super();
        this._textures = {};
        this.sketonOptimise = new SketonOptimise();
    }

    get _mainTexture(): Texture {
        let i = 0;
        let tex: Texture;
        for (let k in this._textures) {
            tex = this._textures[k].realTexture;
            if (tex) {
                i++;
                if (i > 1) {
                    return null;
                }
            }
        }
        return tex;
    }
    mainTexture: Texture;

    mainBlendMode: number = 0;


    get ns(): typeof spine {
        return this._ns;
    }

    get basePath(): string {
        return this._basePath;
    }

    getMaterial(texture: Texture, blendMode: number): Material {
        let key = texture.id + "_" + blendMode;
        let mat = this.materialMap.get(key);
        if (!mat) {
            mat = new Material();
            mat.setShaderName("SpineStandard");
            SpineShaderInit.initSpineMaterial(mat);
            mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture.bitmap);

            SpineShaderInit.SetSpineBlendMode(blendMode, mat);
            //mat.color = this.owner.spineColor;
            //mat.setVector2("u_size",new Vector2(Laya.stage.width,Laya.stage.height));
            mat._addReference();
            this.materialMap.set(key, mat);
        }
        return mat;
    }

    getTexture(name: string): SpineTexture {
        return this._textures[name];
    }

    _parse(desc: string | ArrayBuffer, atlasText: string, createURL: string, progress?: IBatchProgress): Promise<void> {
        this._basePath = URL.getPath(createURL);
        let version = this.getRuntimeVersion(desc);
        let parseAtlas;
        if (version.startsWith('4.'))
            parseAtlas = this.parseAtlas4;
        else
            parseAtlas = this.parseAtlas3;
        if (version == "4.1") {
            this.needSlot = true;
        }
        return parseAtlas.call(this, atlasText, progress).then((atlas: any) => {
            let atlasLoader = new this._ns.AtlasAttachmentLoader(atlas);
            if (desc instanceof ArrayBuffer) {
                let skeletonBinary = new this._ns.SkeletonBinary(atlasLoader, false);
                this.skeletonData = skeletonBinary.readSkeletonData(new Uint8Array(desc));
            } else {
                let skeletonJson = new this._ns.SkeletonJson(atlasLoader, false);
                this.skeletonData = skeletonJson.readSkeletonData(desc);
            }
            this.mainBlendMode = this.skeletonData.slots[0]?.blendMode || 0;
            this.mainTexture = this._mainTexture;
            this.sketonOptimise.checkMainAttach(this.skeletonData);
        });
    }

    private getRuntimeVersion(desc: string | ArrayBuffer): string {
        this._ns = window.spine;
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
        return ILaya.loader.load(atlas.pages.map((page: spine.TextureAtlasPage) => this._basePath + page.name),
            null, progress?.createCallback()).then((res: Array<Texture>) => {
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
        //@ts-ignore
        let tAni = this.skeletonData.getAnimationByIndex(index);
        if (tAni) return tAni.name;
        return null;
    }

    /**
     * 通过皮肤名字得到皮肤索引
     * @param	skinName 皮肤名称
     * @return
     */
    getSkinIndexByName(skinName: string): number {
        //@ts-ignore
        return this.skeletonData.getSkinIndexByName(skinName);
    }

    /**
     * 释放纹理
     * @override
     */
    protected _disposeResource(): void {
        for (let k in this._textures) {
            let tex = this._textures[k].realTexture;
            if (tex) {
                tex._removeReference();
            }
        }
        if (this._referenceCount <= 0) {
            this.materialMap.forEach(value => {
                value._removeReference();
            })
            this.materialMap.clear();
        }
        else {
            console.error("SpineTemplet is using");
        }
    }
}
