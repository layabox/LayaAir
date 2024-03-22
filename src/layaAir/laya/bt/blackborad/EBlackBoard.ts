import { BlackboardComponent } from "./BlackboardComponent";

export enum EBBType {
    Number = 'number',
    String = 'string',
    Other = 'other'
}

export enum EBBNumberOperation {
    greater,
    greaterOrEqual,
    equal,
    lessOrEqual,
    less,
    notEqual
}

export enum EBBStringOperation {
    equal,
    notEqual,
    contain,
    notContain
}

export enum EBBOtherOperation {
    set,
    unSet
}

export class BlackBoardUtils {
    static caculateNumberValue(blackBoradComp: BlackboardComponent, op: EBBNumberOperation, key: string, value: number): boolean {
        let result = blackBoradComp.getData(key);
        switch (op) {
            case EBBNumberOperation.equal:
                return result == value;
            case EBBNumberOperation.notEqual:
                return result != value;
            case EBBNumberOperation.less:
                return result < value;
            case EBBNumberOperation.lessOrEqual:
                return result <= value;
            case EBBNumberOperation.greater:
                return result > value;
            case EBBNumberOperation.greaterOrEqual:
                return result >= value;
        }
    }

    static caculateStringValue(blackBoradComp: BlackboardComponent, op: EBBStringOperation, key: string, value: string) {
        let result = blackBoradComp.getData(key) as string;
        switch (op) {
            case EBBStringOperation.equal:
                return result == value;
            case EBBStringOperation.notEqual:
                return result != value;
            case EBBStringOperation.contain:
                return result.indexOf(value) != -1;
            case EBBStringOperation.notContain:
                return result.indexOf(value) == -1;

        }
    }


    static caculateOtherValue(blackBoradComp: BlackboardComponent, op: EBBOtherOperation, key: string) {
        let result = blackBoradComp.getData(key) as any;
        switch (op) {
            case EBBOtherOperation.set:
                return result != null;
            case EBBOtherOperation.unSet:
                return result == null;
        }
    }
}