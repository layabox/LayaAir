import { EBBType } from "./EBlackBoard"

export class BlackboardData {
    keys: Record<string, DataItem>;
    parent: BlackboardData;

    _isInit: boolean;
    constructor() {
        this.keys = {};
        this.parent = null;
    }

    init() {
        if (!this._isInit) {
            if (this.parent) {
                this.parent.init();
                (this.keys as any).__proto__ = this.parent.keys;
            }
            this._isInit = true;
        }
    }

    getDataDefineBykeyName(keyName: string): DataItem {
        return this.keys[keyName];
    }

    addKey(data: DataItem) {
        this.keys[data.name] = data;
    }

}


export type DataItem = {
    type: EBBType;
    name: string;
}