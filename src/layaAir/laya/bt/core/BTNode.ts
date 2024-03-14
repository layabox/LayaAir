import { IClone } from "../../utils/IClone";
import { BehaviorTreeComponent } from "./BehaviorTreeComponent";

import { BTCompositeNode } from "./BTCompositeNode";

export class BTNode implements IClone {
    //TEST
    static ID: number = 0;
    /**
     * 唯一标识
     */
    id: string;

    nid: number;

    parentNode: BTCompositeNode;

    name: string;

    next: BTNode;

    needCreate: boolean;

    orignNode: BTNode;


    constructor() {
        this.id = this.constructor.name + BTNode.ID++;
    }

    parse(config: any) {

    }

    onAdd(parentNode: BTCompositeNode) {

    }

    setNext(next: BTNode) {
        this.next = next;
    }

    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        this.createNodeContext(btCmp);
        preNode && preNode.setNext(this);
        return this;
    }

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

    getNodeContext(btCmp: BehaviorTreeComponent): BTNodeContext {
        return btCmp.getCurrentTreeInstance().getContextNode(this.id);
    }

    getNodeInstance(btCmp: BehaviorTreeComponent): BTNode {
        return btCmp.getCurrentTreeInstance().getNode(this.id);
    }


    clone() {
        //@ts-ignore
        let result = new this["constructor"]();
        this.cloneTo(result);
        return result;
        //throw new Error("Method not implemented.");
    }

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