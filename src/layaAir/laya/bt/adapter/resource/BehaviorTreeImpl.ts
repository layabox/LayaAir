import { ILoadTask } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { Resource } from "../../../resource/Resource";
import { BehaviorTreeFactory } from "../../BehaviorTreeFactory";
import { BehaviorTree } from "../../core/BehaviorTree";

/**
 * 
 * @ brief: BehaviorTreeImpl
 * @ author: zyh
 * @ data: 2024-02-23 15:51
 */
export class BehaviorTreeImpl extends Resource {
    data: any;
    version: number;
    bt: BehaviorTree;
    typeName: string;
    constructor(data: any, task: ILoadTask, version?: number) {
        super();

        this.data = data;
        this.version = version;
        this.uuid = task.uuid;
        this.url = task.url;
        this.typeName = this.uuid + "_propType";
        this.name = URL.getFileName(task.url);
    }

    create(): any {
        if (!this.bt) {
            this.bt = new BehaviorTree();
            this.bt.target = this.uuid;
            this.bt.parse(this.data);
            BehaviorTreeFactory.initHook(this.uuid);
        }
        return this.bt;
    }
}