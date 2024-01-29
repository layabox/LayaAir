import { BlackboardData } from "./BlackboardData";

export class BlackboardComponent {
    /**
     * 黑板定义数据
     */
    dataAsset: BlackboardData;
    /**
     * 存储数据区
     */
    valueData: any;

    init(dataAsset: BlackboardData) {
        this.dataAsset = dataAsset;
        this.valueData = {};
    }

    getDefineBykey(key: string) {
        return this.dataAsset.getDataDefineBykeyName(key);
    }

    getData(key: string): any {
        let data = this.dataAsset.getDataDefineBykeyName(key);
        if (!data) {
            return;
        }
        return this.valueData[key];

    }

    setData(key: string, value: any): void {
        let data = this.dataAsset.getDataDefineBykeyName(key);
        if (data) {
            this.valueData[key] = value;
        }
    }

}