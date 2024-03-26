import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { TBTDecorator, TBTNode, TBTService } from "../datas/types/BehaviorTreeTypes";
import { BTCompositeNode } from "./BTCompositeNode";
import { BTDecorator } from "./BTDecorator";
import { BTNode } from "./BTNode";
import { BTService } from "./BTService";
import { BTExcuteContext, BehaviorTreeComponent } from "./BehaviorTreeComponent";

/**
 * 
 * @ brief: BTExecutableNode
 * @ author: zyh
 * @ data: 2024-03-05 15:35
 */
export abstract class BTExecutableNode extends BTNode {
    decorators: BTDecorator[];

    services: BTService[];

    hasDebugger: boolean;
    
    onAdd(parentNode: BTCompositeNode): void {
        super.onAdd(parentNode);
        const _childIndex = parentNode.children.indexOf(this);
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.parentNode = parentNode;
                value.childIndex = _childIndex;
            })
        }
        if (this.services) {
            this.services.forEach(value => {
                value.parentNode = parentNode;
                value.childIndex = _childIndex;
            })
        }
    }

    onEnter(btCmp: BehaviorTreeComponent) {
        if (this.services) {
            this.services.forEach(value => {
                value.onEnter(btCmp);
            })
        }
    }

    onActive(btCmp: BehaviorTreeComponent) {
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.onActive(btCmp);
            })
        }
        if (this.services) {
            this.services.forEach(value => {
                value.onActive(btCmp);
            })
        }
    }

    onLeave(btCmp: BehaviorTreeComponent) {
        if (this.services) {
            this.services.forEach(value => {
                value.onLeave(btCmp);
            })
        }
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.onLeave(btCmp);
            })
        }
    }

    addService(service: BTService) {
        if (!this.services) {
            this.services = [];
        }
        this.services.push(service);
        // service.parentNode = this.parentNode;
        // service.childIndex = this.parentNode.children.indexOf(this);

    }

    addDecorator(decorator: BTDecorator) {
        if (!this.decorators) {
            this.decorators = [];
        }
        this.decorators.push(decorator);
        // decorator.parentNode = this.parentNode;
        // decorator.childIndex = this.parentNode.children.indexOf(this);
    }

    preCheck(preNode: BTNode, btCmp: BehaviorTreeComponent): BTNode {
        if (this.decorators) {
            this.decorators.forEach(value => {
                value.createNodeContext(btCmp);
            })
        }
        if (this.services) {
            this.services.forEach(value => {
                value.createNodeContext(btCmp);
            })
        }
        return super.preCheck(preNode, btCmp);
    }

    parse(config: TBTNode): void {
        super.parse(config);
        this.parseAuxiliary(config);
    }

    parseAuxiliary(config: TBTNode) {
        if (config.decorator) {
            config.decorator.forEach((value: TBTDecorator) => {
                let node = BehaviorTreeFactory.instance.createNew(value as TBTNode) as BTDecorator;
                this.addDecorator(node);
            })
        }
        if (config.service) {
            config.service.forEach((value: TBTService) => {
                let node = BehaviorTreeFactory.instance.createNew(value as TBTNode) as BTService;
                this.addService(node);
            })
        }
    }

    beginExcute(btCmp: BehaviorTreeComponent, excuteContext?: BTExcuteContext): boolean {
        return false;
    }
}