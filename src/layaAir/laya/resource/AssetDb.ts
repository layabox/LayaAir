export class AssetDb {
    static inst: AssetDb = new AssetDb();

    uuidMap: Record<string, string> = {};
    metaMap: Record<string, any> = {};

    UUID_to_URL(uuid: string): string {
        return this.uuidMap[uuid];
    }

    UUID_to_URL_async(uuid: string): Promise<string> {
        console.error(`unknown uuid: ${uuid}`);
        return null;
    }

    URL_to_UUID_async(url: string): Promise<string> {
        return null;
    }

    getMeta(url: string, uuid: string): any {
        return this.metaMap[uuid];
    }

    getSubAssetURL(url: string, uuid: string, subAssetName: string, subAssetExt: string): string {
        return `${url}@${subAssetName}.${subAssetExt}`;
    }
}