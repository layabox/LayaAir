import { IClone } from "../../utils/IClone";
import { TBTNode } from "../datas/types/BehaviorTreeTypes";
import { BehaviorTreeComponent } from "./BehaviorTreeComponent";

import { BTCompositeNode } from "./BTCompositeNode";

export class BTNode implements IClone {
    /**@private */
    static ID: number = 0;
    /**
     * 唯一标识
     */
    id: string;
    /**@private */
    nid: number;
    /**@private */
    parentNode: BTCompositeNode;

    name: string;
    /**@private */
    next: BTNode;
    /**@private */
    needCreate: boolean;
    /**@private */
    orignNode: BTNode;

    constructor() {
        this.id = this.constructor.name + BTNode.ID++;
    }
    /**@private */
    parse(config: TBTNode) {
        const props = config.props;
        if (props) {
            for (const key in props) {
                //@ts-ignore
                this[key] = props[key];
            }
        }
    }
    /**@private */
    onAdd(parentNode: BTCompositeNode) {

    }
    /**@private */
    setNext(next: BTNode) {
        this.next = next;
    }
    /**@private */
    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        this.createNodeContext(btCmp);
        preNode && preNode.setNext(this);
        return this;
    }
    /**@private */
    testTrace() {
        console.log(this.constructor.name + ">>:" + this.name);
    }

    createNodeContext(btCmp: BehaviorTreeComponent) {
        if (this.needCreate) {
            let result = this.clone();
            result.orignNode = this;
            btCmp.getCurrentTreeInstance().setNode(this.id, result as any as BTNode);
        }
        let result = this.newContext();
        result.id = this.id;
        result.nodeName = this.name;
        btCmp.getCurrentTreeInstance().setContextNode(this.id, result);
    }

    protected newContext() {
        return new BTNodeContext();
    }
    /**@private */
    getNodeContext(btCmp: BehaviorTreeComponent): BTNodeContext {
        return btCmp.getCurrentTreeInstance().getContextNode(this.id);
    }
    /**@private */
    getNodeInstance(btCmp: BehaviorTreeComponent): BTNode {
        return btCmp.getCurrentTreeInstance().getNode(this.id);
    }

    /**@private */
    clone() {
        //@ts-ignore
        let result = new this["constructor"]();
        this.cloneTo(result);
        return result;
        //throw new Error("Method not implemented.");
    }
    /**@private */
    cloneTo(destObject: any): void {
        destObject.name = this.name;
        destObject.parentNode = this.parentNode;
        destObject.id = this.id;
        //throw new Error("Method not implemented.");
    }

}

export class BTNodeContext {
    id: string;
    nodeName: string;
}