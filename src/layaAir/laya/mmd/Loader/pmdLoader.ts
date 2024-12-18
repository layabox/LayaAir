
import { ILoadTask, IResourceLoader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { Resource } from "../../resource/Resource";
import { mmdToMesh } from "./mmdToLaya";
import type { ILogger } from "./Parser/ILogger";
import { PmdReader } from "./Parser/pmdReader";
import type { PmxObject } from "./Parser/pmxObject";

/**
 * PmdLoader is a loader that loads the model in the PMD format
 *
 * PMD is a binary file format that contains all the data except the texture of the model
 */
export class PmdLoader implements ILogger, IResourceLoader {
    log(message: string): void {
        throw new Error("Method not implemented.");
    }
    warn(message: string): void {
        throw new Error("Method not implemented.");
    }
    error(message: string): void {
        throw new Error("Method not implemented.");
    }

    async load(task: ILoadTask) {
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "pmd");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            return this._parse(task , data);
        });
    }    

    async _parse( task:ILoadTask , data:ArrayBuffer) : Promise<Resource>{
        let ret = await PmdReader.ParseAsync(data, this);
        return mmdToMesh(ret);
    }
        
}
