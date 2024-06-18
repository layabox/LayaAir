import { Laya } from "../../Laya";
import { URL } from "../net/URL";
import { Delegate } from "./Delegate";
import { Utils } from "./Utils";

export class Dependence {
    private static _instance: Dependence;
    public static get instance(): Dependence {
        return this._instance ||= new Dependence;
    }

    /** 任务队列 */
    tasks: Record<string, DependencieTask> = {};

    /**
     * 完成任务
     * @param url 
     */
    public finish(url: string) {
        let task = this.tasks[url];
        if (!task) {
            task = new DependencieTask(url);
            this.tasks[url] = task;
        }

        task.onComplete.invoke();
        task.loaded = true;
    }

    /**
     * 等待资源完成
     * @param  
     * @returns 
     */
    public wait(url: string): Promise<any> {
        let res = Laya.loader.getRes(url);
        if (res) {
            delete this.tasks[url];
            return Promise.resolve();
        }

        let task = this.tasks[url];

        if (!task) {
            task = new DependencieTask(url);
            this.tasks[url] = task;
            return new Promise((resolve) => {
                task.onComplete.add(resolve);
                Laya.loader.load(url)
                    .then(res => {
                        if (Utils.getFileExtension(res.url) != "bp") {//非蓝图情况
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

class DependencieTask {
    onComplete: Delegate;
    url: string;
    loaded: boolean = false;
    constructor(url: string) {
        this.onComplete = new Delegate();
        this.url = url;
    }

    clear() {
        this.onComplete.clear();
        this.url = null;
    }

}