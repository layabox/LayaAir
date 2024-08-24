import { Laya } from "../../Laya";
import { IBatchProgress } from "../net/BatchProgress";
import { IResourceLoader, ILoadTask, Loader, ILoadURL } from "../net/Loader";
import { URL } from "../net/URL";
import { Texture2D } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { SpineTemplet } from "./SpineTemplet";
import { SpineTexture } from "./SpineTexture";

class SpineTempletLoader implements IResourceLoader {

    load(task: ILoadTask) {
        let atlasUrl = Utils.replaceFileExtension(task.url, "atlas");

        return Promise.all([
            task.loader.fetch(task.url, task.ext == "skel" ? "arraybuffer" : "json", task.progress.createCallback()),
            task.loader.fetch(atlasUrl, "text", task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let templet = new SpineTemplet();
            let version = SpineTemplet.RuntimeVersion;
            if (version == "4.1") {
                templet.needSlot = true;
            }

            // debugger
            if (version.startsWith('4.'))
                return this.parseAtlas4(res[0] , res[1] , task , templet);
            else
                return this.parseAtlas3(res[0] , res[1] , task , templet);
        });
    }

    private parseAtlas3( desc: string | ArrayBuffer , atlasText: string, task:ILoadTask , templet:SpineTemplet): Promise<SpineTemplet> { 
        let atlasPages: Array<ILoadURL> = [];
        let basePath = URL.getPath(task.url);
        //@ts-ignore
        let atlas = new spine.TextureAtlas(atlasText, (path: string) => {
            let url = basePath + path;
            atlasPages.push({ 
                url ,
                type : Loader.TEXTURE2D ,
                propertyParams:{
                    premultiplyAlpha:true
                }
            });
            return new SpineTexture(null);
        });

        return Laya.loader.load(atlasPages, null, task.progress?.createCallback()).then((res: Array<Texture2D>) => {
            let textures:Record<string , Texture2D> = {}
            let tex = res[0];
            if (tex) tex._addReference();
            let pages = atlas.pages;
            // 默认长度 = 1
            let page = pages[0];
            //@ts-ignore
            page.texture.realTexture = tex;
            page.texture.setFilters(page.minFilter, page.magFilter);
            page.texture.setWraps(page.uWrap, page.vWrap);
            page.width = page.texture.getImage().width;
            page.height = page.texture.getImage().height;
            textures[page.name] = tex;
          

            let regions = atlas.regions;
            for (const region of regions) {
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
            templet._parse(desc ,atlas , textures);
            return templet;
        });
    }

    private parseAtlas4( desc: string | ArrayBuffer, atlasText: string, task: ILoadTask , templet:SpineTemplet): Promise<SpineTemplet> {
        let atlas = new spine.TextureAtlas(atlasText);
        let basePath = URL.getPath(task.url);
        return Laya.loader.load(atlas.pages.map((page: spine.TextureAtlasPage) => {
            return { 
                url :basePath + page.name , 
                type :Loader.TEXTURE2D,
                propertyParams:{
                    premultiplyAlpha:true
                }
            }
        }),
            null, task.progress?.createCallback()).then((res: Array<Texture2D>) => {
                let textures:Record<string , Texture2D> = {}
                let pages = atlas.pages;
                for (let i = 0 , len = res.length; i < len; i++) {
                    let tex = res[i];
                    if (tex) tex._addReference();
                    let page = pages[i];
                    textures[page.name] = tex;
                    //@ts-ignore
                    page.setTexture(new SpineTexture(tex));
                }

                templet._parse( desc , atlas , textures);
                return templet;
            });
    }
}

Loader.registerLoader(["skel"], SpineTempletLoader, Loader.SPINE);
