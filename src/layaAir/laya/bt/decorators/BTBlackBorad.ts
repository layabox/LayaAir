import { BlackBoardUtils, EBBType } from "../blackborad/EBlackBoard";
import { BehaviorTreeComponent } from "../core/BehaviorTreeComponent";
import { BTDecorator } from "../core/BTDecorator";


export class BTBlackBorad extends BTDecorator {

    keyName: string;
    op: number;
    value: any;

    canExcute(btCmp: BehaviorTreeComponent): boolean {
        let item = btCmp.blackBoradComp.getDefineBykey(this.keyName);
        let result: boolean;
        switch (item.type) {
            case EBBType.Number:
                result = BlackBoardUtils.caculateNumberValue(btCmp.blackBoradComp, this.op, this.keyName, this.value);
                break;
            case EBBType.String:
                result = BlackBoardUtils.caculateStringValue(btCmp.blackBoradComp, this.op, this.keyName, this.value);
                break;
            default:
                result = BlackBoardUtils.caculateOtherValue(btCmp.blackBoradComp, this.op, this.keyName);
                break;
        }
        return result;
    }

}