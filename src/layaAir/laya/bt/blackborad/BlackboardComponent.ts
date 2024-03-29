import { BlackboardData } from "./BlackboardData";
import { EBBType } from "./EBlackBoard";

export class BlackboardComponent {
    /**
     * @internal
     * 黑板定义数据
     */
    private dataAsset: BlackboardData;
    /**
     * @internal
     * 存储数据区
     */
    private valueData: any;
    /**
     * @private
     * @param dataAsset 
     */
    init(dataAsset: BlackboardData) {
        this.dataAsset = dataAsset;
        this.valueData = {};
        for(let key in dataAsset.keys){
            let data = dataAsset.keys[key];
            if(data){
                if(data.type==EBBType.Number){
                    this.valueData[data.name] = 0;
                }
            }
        }
    }
    /**
     * @private
     * @param key 
     * @returns 
     */
    getDefineBykey(key: string) {
        return this.dataAsset.getDataDefineBykeyName(key);
    }
    /**
     * 根据key获取黑板数值
     * @param key 
     * @returns 
     */
    getData(key: string): any {
        let data = this.dataAsset.getDataDefineBykeyName(key);
        if (!data) {
            return;
        }
        return this.valueData[key];

    }
    /**
     * 设置黑板数值
     * @param key 
     * @param value 
     */
    setData(key: string, value: any): void {
        let data = this.dataAsset.getDataDefineBykeyName(key);
        if (data) {
            this.valueData[key] = value;
        }
    }

}