import { BehaviorTreeFactory } from "../BehaviorTreeFactory";
import { BTDecorator } from "./BTDecorator";
import { BTNode } from "./BTNode";
import { BTService } from "./BTService";
import { BehaviorTreeComponent } from "./BehaviorTreeComponent";

/**
 * 
 * @ brief: BTExecutableNode
 * @ author: zyh
 * @ data: 2024-03-05 15:35
 */
export abstract class BTExecutableNode extends BTNode {
    decorators: BTDecorator[];

    services: BTService[];

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
        service.parentNode = this.parentNode;
        service.childIndex = this.parentNode.children.indexOf(this);

    }

    addDecorator(decorator: BTDecorator) {
        if (!this.decorators) {
            this.decorators = [];
        }
        this.decorators.push(decorator);
        decorator.parentNode = this.parentNode;
        decorator.childIndex = this.parentNode.children.indexOf(this);
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

    parseAuxiliary(config: any, btConfig: any) {
        if (config.decorators) {
            config.decorators.forEach((value: any) => {
                let node = BehaviorTreeFactory.instance.createNew(btConfig[value], btConfig) as BTDecorator;
                this.addDecorator(node);
            })
        }
        if (config.services) {
            config.services.forEach((value: any) => {
                let node = BehaviorTreeFactory.instance.createNew(btConfig[value], btConfig) as BTService;
                this.addService(node);
            })
        }
    }
}