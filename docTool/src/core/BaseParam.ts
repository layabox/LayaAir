import { TBPDeclarationParam } from "../tools/BlueprintDeclaration";
import { IBaseParam, IBaseParamData } from "./interface/IBase";

/**
 * 
 * @ brief: BaseParam
 * @ author: zyh
 * @ data: 2024-04-23 15:54
 */
export class BaseParam implements IBaseParam {
    params: IBaseParamData[];

    /* constructor(data: IBaseParam) {
        this.params = data.params;
    } */
    constructor() {
        this.params = [];
    }

    addParam(key: string, value: string) {
        this.params.push({ key, value });
    }

    getParam(key: string): IBaseParamData {
        return this.params.find((item) => {
            return item.key === key;
        });
    }

    updateMethodParamByDatas(datas: TBPDeclarationParam[], tips: string[]) {
        if(!datas){
            return;
        }
        const _params = [];
        for (let index = 0; index < datas.length; index++) {
            const data = datas[index];
            let param = this.getParam(data.name);
            if (param) {
                param.value = tips[index];
            } else {
                param = { key: data.name, value: tips[index] };
            }
            _params.push(param);
        };

        this.params = _params;
    }

    toString(): string {
        let str = "";
        this.params.forEach((item) => {
            str += `  - ${item.key}: ${item.value}\n`;
        });
        return str;
    }

    getEmptydata() {
        let _params = [];
        this.params.forEach((item) => {
            if(!item.value){
                const _item = {};
                _item[item.key] = '';
                _params.push(_item);
            }
        });
        if(_params.length === 0){
            return null;
        }
        let obj: any = {};
        obj.params = _params;
        return obj;
    }

    writeEmptyData(data: any): void {
        if(data.params){
            data.params.forEach((item: any) => {
                const key = Object.keys(item)[0];
                const param = this.getParam(key);
                if(param){
                    param.value = item[key];
                }
            });
        }
    }
}