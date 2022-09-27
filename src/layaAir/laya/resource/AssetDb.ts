import { Utils } from "../utils/Utils";

export class AssetDb {
    static inst: AssetDb = new AssetDb();

    uuidMap: Record<string, string> = {};
    shaderNameMap: Record<string, string> = {};
    metaMap: Record<string, any> = {};

    UUID_to_URL(uuid: string): string {
        return this.uuidMap[uuid];
    }

    UUID_to_URL_async(uuid: string): Promise<string> {
        console.warn(`unknown uuid: ${uuid}`);
        return null;
    }

    URL_to_UUID_async(url: string): Promise<string> {
        return null;
    }

    shaderName_to_URL(shaderName: string): string {
        return this.shaderNameMap[shaderName];
    }

    shaderName_to_URL_async(shaderName: string): Promise<string> {
        console.warn(`unknown shaderName: ${shaderName}`);
        return null;
    }

    getMeta(url: string, uuid: string): any {
        return this.metaMap[uuid];
    }

    getSubAssetURL(url: string, uuid: string, subAssetName: string, subAssetExt: string): string {
        return `${Utils.replaceFileExtension(url, "")}@${subAssetName}.${subAssetExt}`;
    }
}