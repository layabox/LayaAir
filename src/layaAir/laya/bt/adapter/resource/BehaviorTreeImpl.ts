import { ILoadTask } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { Resource } from "../../../resource/Resource";
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
        let bt = new BehaviorTree();
        bt.parse(this.data);
        return bt;
    }
}