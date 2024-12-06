import { SerializeUtil } from "../../../../loaders/SerializeUtil";
import { ILoadOptions, ILoadTask, ILoadURL, IResourceLoader, Loader } from "../../../../net/Loader";
import { TileSet } from "../TileSet";
import { TileSetCellGroup } from "../TileSetCellGroup";
import { URL } from "../../../../net/URL";
import { Byte } from "../../../../utils/Byte";

class TileSetLoader implements IResourceLoader {
    load(task: ILoadTask): Promise<any> {
        
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;
            if (!data.groups) data.groups = [];
            const groups = data.groups;
            let basePath = URL.getPath(task.url);
            let urls :Array<ILoadURL> = [];
            for (let i = 0, len = groups.length; i < len; i++) {
                let atlas = groups[i].atlas;
                if (atlas&&atlas.path) {
                    atlas.path = URL.join(basePath, atlas.path);
                    urls.push({url:atlas.path,type:Loader.TEXTURE2D,propertyParams:{premultiplyAlpha:true}});
                }else{
                    urls.push({ url: "res://" + groups[i].atlas._$uuid, type: Loader.TEXTURE2D, propertyParams: { premultiplyAlpha: true } });
                }
            }
            return this.load2(task, data, urls);
        });
    }
    private load2(task: ILoadTask, data: any, urls: Array<ILoadURL>): Promise<any> {
        let options: ILoadOptions = Object.assign({}, task.options);
        options.initiator = task;
        delete options.cache;
        delete options.ignoreCache;
        return task.loader.load(urls, options, task.progress.createCallback()).then(() => {
            let tileSet = new TileSet();
            tileSet.tileShape = data.tileShape?data.tileShape:0;
            for (let i = 0, len = data.groups.length; i < len; i++) {
                this.createGroup(tileSet, data.groups[i]);
            }
            tileSet._notifyTileSetCellGroupsChange();
            return tileSet;
        });
    }
    private createGroup(tileSet: TileSet, data: any) {
        let group = new TileSetCellGroup();
        group.id = data.id;
        group.name = data.name;
        tileSet.addTileSetCellGroup(group);
        SerializeUtil.decodeObj(data, group);
        if(data.atlas.path){
            group.atlas = Loader.getBaseTexture(data.atlas.path);
        }
       
    }
}

export class TileMapDatasParse{
    static read(buffer:ArrayBuffer){
        let byte = new Byte(buffer);
        byte.pos = 0;
        let version = byte.readUTFString();
        if (!version.startsWith("TILEMAPLAYER_DATA")) return null;
        let chunkNum = byte.readUint32();
        let chunks = [];
        for (let i = 0; i < chunkNum; i++) {
            let x = byte.readFloat32();            
            let y = byte.readFloat32();
            let length = byte.readUint32();

            let tiles:number[] = [];
            for (let j = 0; j < length; j++) {
                let localId = byte.readUint32();
                let gid = byte.readUint32();  
                tiles.push(localId , gid);              
            }

            let chunkInfos = {x,y,length,tiles};
            chunks.push(chunkInfos);
        }
        return chunks;
    }
}
// class TileMapLayerLoader implements IResourceLoader{
//     load(task: ILoadTask): Promise<any> {
//         return task.loader.fetch(task.url, "arraybuffer", task.progress.createCallback(0.2), task.options).then(buffer=>{
//             if (!buffer) return null;
//             return this.parse(buffer);
//         })
//     }
// }

Loader.registerLoader(["tres"], TileSetLoader, "tres");
// Loader.registerLoader(["trdata"], TileMapLayerLoader, "trdata");