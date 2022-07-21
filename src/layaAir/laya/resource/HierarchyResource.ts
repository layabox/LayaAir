import { Node } from "../display/Node";
import { Resource } from "./Resource";

export class HierarchyResource extends Resource {
    createScene(options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let ret = this.createNodes();
        if (ret)
            return [ret];
        else
            return null;
    }

    createNodes(options?: Record<string, any>, errors?: Array<any>): Node {
        return null;
    }
}