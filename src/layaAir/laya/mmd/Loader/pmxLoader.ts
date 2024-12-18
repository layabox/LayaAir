import { ILoadTask, IResourceLoader } from "../../net/Loader";
import { AssetDb } from "../../resource/AssetDb";
import { Resource } from "../../resource/Resource";
import { ILogger } from "./Parser/ILogger";
import { PmxReader } from "./Parser/pmxReader";

/**
 * PmxLoader is a loader that loads the model in the PMX format
 *
 * PMX is a binary file format that contains all the data except the texture of the model
 */
export class PmxLoader implements IResourceLoader,ILogger {
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
        let url = AssetDb.inst.getSubAssetURL(task.url, task.uuid, null, "pmx");
        return task.loader.fetch(url, "arraybuffer", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            return this._parse(task , data);
        });
    }

    async _parse( task:ILoadTask , data:ArrayBuffer) : Promise<Resource>{
        let ret = await PmxReader.ParseAsync(data, this)
        return null;
    }

}
