import { Stat } from "../../utils/Stat";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTService } from "../core/BTService";


export class TestService extends BTService {
    onEnter(btCmp: BehaviorTreeComponent) {
        let node = this.parentNode.children[this.childIndex];

        console.log(">>>>>>service enter :" + node.name + ">>>>>" + Stat.loopCount);

    }

    onLeave(btCmp: BehaviorTreeComponent) {
        let node = this.parentNode.children[this.childIndex];

        console.log(">>>>>>service leave :" + node.name + ">>>>>" + Stat.loopCount);
    }

}