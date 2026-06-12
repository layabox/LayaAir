import { Laya } from "../../Laya";
import { IResourceLoader, ILoadTask, Loader } from "../net/Loader";
import { AssetDb } from "../resource/AssetDb";
import { Material } from "../resource/Material";
import { Texture2D } from "../resource/Texture2D";
import { Utils } from "../utils/Utils";
import { SpineConst } from "./SpineConst";
import { SpineTemplet, TSpineMaterialMap } from "./SpineTemplet";

type TSpineMaterialRef = string | { "_$uuid"?: string } | null;

export interface ISpineRuntimeData {
    source?: string;
    spineMaterialTextures?: Record<string, string>;
    spineMaterials2D?: Record<string, TSpineMaterialRef>;
    spineMaterials3D?: Record<string, TSpineMaterialRef>;
}

/**
 * @en SpineTempletLoader class used for loading Spine skeleton data and atlas.
 * @zh SpineTempletLoader 类用于加载 Spine 骨骼数据和图集。
 */
export class SpineTempletLoader implements IResourceLoader {

    /**
     * @en Load Spine skeleton data and atlas.
     * @param task The load task.
     * @zh 加载 Spine 骨骼数据和图集。
     * @param task 加载任务。
     */
    load(task: ILoadTask): Promise<SpineTemplet> {
        let ext = Utils.getFileExtension(task.url);
        if (ext === "json")
            return task.loader.fetch(task.url, "json", task.progress.createCallback()).then((data: any) => this.loadSpineSource(task, task.url, data));

        return this.loadSpineSource(task, task.url);
    }

    private loadSpineSource(task: ILoadTask, url: string, spineData?: any): Promise<SpineTemplet> {
        return AssetDb.inst.resolveURL(url).then(resolvedUrl => this.loadSpineSourceResolved(task, resolvedUrl || url, spineData));
    }

    private loadSpineSourceResolved(task: ILoadTask, url: string, spineData?: any): Promise<SpineTemplet> {
        let atlasUrl = Utils.replaceFileExtension(url, "atlas");
        let ext = Utils.getFileExtension(url);

        return Promise.all([
            spineData !== undefined ? Promise.resolve(spineData) : task.loader.fetch(url, ext == "skel" || ext == "bin" ? "arraybuffer" : "json", task.progress.createCallback()),
            task.loader.fetch(atlasUrl, "text", task.progress.createCallback())
        ]).then(res => {
            if (!res[0] || !res[1])
                return null;

            let parser = SpineConst.factory.createSpineTempletParser();
            let sourceTask: ILoadTask = url === task.url ? task : Object.assign(Object.create(task), { url });
            let urls = parser.collectTextures(res[1], sourceTask);
            return Laya.loader.load(urls, null, task.progress.createCallback()).then((textures: Array<Texture2D>) => {
                let templet = parser.create(res[0], textures);
                return this.loadRuntimeMeta(task, url).then(data => SpineTempletLoader.applyRuntimeData(templet, data, task));
            });
        });
    }

    private async loadRuntimeMeta(task: ILoadTask, resolvedUrl: string): Promise<ISpineRuntimeData> {
        let data = AssetDb.inst.metaMap[task.url] || AssetDb.inst.metaMap[resolvedUrl];
        if (!data && task.uuid)
            data = await AssetDb.inst.getMeta(task.url, task.uuid);
        return data;
    }

    static async applyRuntimeData(templet: SpineTemplet, data: ISpineRuntimeData, task?: ILoadTask): Promise<SpineTemplet> {
        if (!templet)
            return templet;

        if (!data) {
            templet.spineMaterialTextures = {};
            templet.spineMaterials2D = {};
            templet.spineMaterials3D = {};
            return templet;
        }

        templet.spineMaterialTextures = data.spineMaterialTextures || {};

        let [materials2D, materials3D] = await Promise.all([
            SpineTempletLoader.loadMaterialMap(data.spineMaterials2D, templet, task),
            SpineTempletLoader.loadMaterialMap(data.spineMaterials3D, templet, task)
        ]);
        templet.spineMaterials2D = materials2D || {};
        templet.spineMaterials3D = materials3D || {};

        return templet;
    }

    private static async loadMaterialMap(data: Record<string, TSpineMaterialRef>, templet: SpineTemplet, task?: ILoadTask): Promise<TSpineMaterialMap> {
        if (!data)
            return null;

        let result: TSpineMaterialMap = {};
        let promises: Promise<void>[] = [];
        for (let key in data) {
            if (key.indexOf("_$") === 0)
                continue;

            let runtimeKey = SpineTempletLoader.getRuntimeMaterialKey(key, templet);
            let url = SpineTempletLoader.getMaterialURL(data[key]);
            if (!url) {
                result[runtimeKey] = null;
                continue;
            }

            promises.push(Laya.loader.load(url, Loader.MATERIAL, task?.progress?.createCallback()).then((material: Material) => {
                result[runtimeKey] = material || null;
            }));
        }

        await Promise.all(promises);
        return result;
    }

    private static getRuntimeMaterialKey(key: string, templet: SpineTemplet): string {
        let match = /^(.*)_([0-3])_(true|false)_(2D|3D)$/.exec(key);
        if (!match)
            return key;

        let texture = SpineTempletLoader.getTextureByStorageKey(match[1], templet);
        if (!texture)
            return key;

        return `${texture.id}_${match[2]}_${match[3]}_${match[4]}`;
    }

    private static getTextureByStorageKey(key: string, templet: SpineTemplet): Texture2D {
        let textures = templet?._textures;
        if (!textures)
            return null;

        let name = templet.spineMaterialTextures?.[key];
        if (name && textures[name])
            return textures[name];

        for (let name in textures) {
            let texture = textures[name];
            if (texture && (name === key || texture.url === key || texture.uuid === key || String(texture.id) === key))
                return texture;
        }

        return null;
    }

    private static getMaterialURL(ref: TSpineMaterialRef): string {
        if (!ref)
            return null;

        let url = typeof ref === "string" ? ref : ref._$uuid;
        if (!url)
            return null;

        if (url.indexOf("://") == -1 && url.indexOf("/") == -1 && url.indexOf(".") == -1)
            url = "res://" + url;
        return url;
    }
}

Loader.registerLoader(["skel", "json"], SpineTempletLoader, Loader.SPINE);
