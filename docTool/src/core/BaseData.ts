import { BaseParam } from "./BaseParam";
import { IBaseData, IBaseParam } from "./interface/IBase";

/**
 * 
 * @ brief: BaseData
 * @ author: zyh
 * @ data: 2024-04-23 15:52
 */
export class BaseData implements IBaseData {
    name: string;
    describe: string;
    tips: string;
    param?: IBaseParam;
    returns?: string;

    /* constructor(data: IBaseData) {
        this.name = data.name;
        this.describe = data.describe;
        this.tips = data.tips;
        if(data.param)
            this.param = new BaseParam(data.param);
    } */

    toString(): string {
        let str = `- name: ${this.name}\n`;
        if (this.describe) {
            str += `- describe: ${this.describe}\n`;
        }
        str += `- tips: ${this.tips || ''}`;
        if (this.param && this.param.params.length > 0) {
            str += `\n- param:\n`;
            str += this.param.toString();
        }
        if (this.returns) {
            str += `\n- returns: ${this.returns}\n`;
        }
        return str;
    }

    getEmptydata() {
        let obj: any = {};
        if (this.param) {
            const _param = this.param.getEmptydata();
            if (_param)
                obj.param = _param;
        }

        if (!this.name)
            obj.name = '';
        if (!this.describe)
            obj.describe = '';
        if (!this.tips)
            obj.tips = '';
        if (!this.returns)
            obj.returns = '';

        if (Object.keys(obj).length === 0) {
            return null;
        }
        return obj;
    }

    writeEmptyData(data: any): void {
        if (data.name) {
            this.name = data.name;
        }
        if (data.describe) {
            this.describe = data.describe;
        }
        if (data.tips) {
            this.tips = data.tips;
        }
        if (data.param) {
            this.param.writeEmptyData(data.param);
        }
        if (data.returns) {
            this.returns = data.returns;
        }
    }
}