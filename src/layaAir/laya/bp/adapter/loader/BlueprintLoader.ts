import { BlueprintImpl } from "../resource/BlueprintImpl";

import { BlueprintConst } from "../../core/BlueprintConst";
import { ILoadTask, IResourceLoader, Loader } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { HierarchyLoader } from "../../../loaders/HierarchyLoader";
import { Delegate } from "../../../utils/Delegate";
import { Laya } from "Laya";

export class BlueprintLoader implements IResourceLoader{

    load(task: ILoadTask):Promise<BlueprintImpl>{
        return task.loader.fetch(task.url,"json",task.progress.createCallback(0.2),task.options).then(data =>{
            if (!data) return null;
            if (data._$ver != null) {
                return this._parse(task,data,data._$ver);
            }else{
                console.error("Unknow Version!");
                return null;
            } 
        })
    }

    private _parse( task:ILoadTask , data:any , version: number ):Promise<BlueprintImpl>{
        let basePath = URL.getPath(task.url);
        //引擎精灵解析
        let links = HierarchyLoader.v3.collectResourceLinks(data,basePath);
        
        Dependence.instance.finish("res://" + task.uuid);

        if (links && links.length !== 0) {
            let promises:Promise<any>[] = [];
            let progress = 0;
            for (let i = links.length - 1; i > -1; i--) {
                let link = links[i];
                let url = typeof(link) == "string" ? link : link.url;
                // if (!res) {
                    let promise = Dependence.instance.wait(url)
                    .finally(()=>{progress ++});
                    promises.push(promise);
                // }else{
                //     progress ++;
                // }
            }

            return Promise.all(promises).then(()=>{
                return new BlueprintImpl(data , task ,version);
            });
        }else
            return Promise.resolve(new BlueprintImpl(data , task ,version));
    }
}

export class Dependence{
    private static _instance: Dependence;
    public static get instance(): Dependence {
        return this._instance ||= new Dependence;
    }

    tasks: Record<string,BPDependencieTask> = {};

    public finish(url:string){
        // let fullPath = URL.formatURL(url);
        let task = this.tasks[url];
        if (!task){
            task = new BPDependencieTask(url);
            this.tasks[url] = task;
        }

        task.onComplete.invoke();
        task.loaded = true;
    }

    public wait(url:string){
        let res = Laya.loader.getRes(url);
        if (res){
            delete this.tasks[url];
            return Promise.resolve();
        } 
        
        // let fullPath = URL.formatURL(url);
        let task = this.tasks[url];
        
        if (!task) {
            task = new BPDependencieTask(url);
            this.tasks[url] = task;
            return new Promise((resolve) => {
                task.onComplete.add(resolve);
                Laya.loader.load(url)
                .then(res=>{
                    if (!(res instanceof BlueprintImpl)) {
                        this.finish(url);
                        delete this.tasks[url];
                    }
                    return Promise.resolve();
                });
            });
        }
        else if (task.loaded) {
            return Promise.resolve();
        }
        else
            return new Promise((resolve) => task.onComplete.add(resolve));
    }

}

class BPDependencieTask{
    onComplete: Delegate;
    url:string;
    loaded:boolean = false;
    constructor(url:string){
        this.onComplete = new Delegate();
        this.url = url;
    }

    clear(){
        this.onComplete.clear();
        this.url = null;
    }

}


Loader.registerLoader([BlueprintConst.EXT],BlueprintLoader, BlueprintConst.TYPE); 