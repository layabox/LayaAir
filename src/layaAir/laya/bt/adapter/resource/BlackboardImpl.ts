import { ILoadTask } from "../../../net/Loader";
import { URL } from "../../../net/URL";
import { Resource } from "../../../resource/Resource";
import { BlackboardData } from "../../blackborad/BlackboardData";

/**
 * 
 * @ brief: BlackboardImpl
 * @ author: zyh
 * @ data: 2024-03-01 15:47
 */
export class BlackboardImpl extends Resource {
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
        let bb = new BlackboardData();
        bb.parse(this.data);
        bb.init();
        return bb;
    }

}