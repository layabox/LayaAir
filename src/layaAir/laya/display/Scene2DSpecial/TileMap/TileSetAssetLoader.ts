import { SerializeUtil } from "../../../loaders/SerializeUtil";
import { ILoadOptions, ILoadTask, ILoadURL, IResourceLoader, Loader } from "../../../net/Loader";
import { TileSet } from "./TileSet";
import { TileSetCellGroup } from "./TileSetCellGroup";
import { URL } from "../../../net/URL";

class TileSetAssetLoader implements IResourceLoader {
    load(task: ILoadTask): Promise<any> {
        
        return task.loader.fetch(task.url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;
            if (!data.cells) data.cells = [];
            const cellsData = data.cells;
            let basePath = URL.getPath(task.url);
            let urls :Array<ILoadURL> = [];
            for (let i = 0, len = cellsData.length; i < len; i++) {
                let atlas = cellsData[i].atlas;
                if (atlas&&atlas.path) {
                    atlas.path = URL.join(basePath, atlas.path);
                    urls.push({url:atlas.path,type:Loader.TEXTURE2D,propertyParams:{premultiplyAlpha:true}});
                }else{
                    urls.push({ url: "res://" + cellsData[i].atlas._$uuid, type: Loader.TEXTURE2D, propertyParams: { premultiplyAlpha: true } });
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
            for (let i = 0, len = data.cells.length; i < len; i++) {
                this.createGroup(tileSet, data.cells[i]);
            }
            tileSet._refeashAlternativesId();
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


Loader.registerLoader(["tres"], TileSetAssetLoader, "tres");