import { BaseData } from "./BaseData";
import { IBaseData } from "./interface/IBase";
import { IMethodsData } from "./interface/IMethods";

/**
 * 
 * @ brief: MethodsData
 * @ author: zyh
 * @ data: 2024-04-23 16:09
 */
export class MethodsData implements IMethodsData {
    name: string;
    returns: string;
    ZH: IBaseData;
    EN: IBaseData;
    /* constructor(data: IMethodsData) {
        this.name = data.name;
        this.returns = data.returns;
        this.ZH = new BaseData(data.ZH);
        this.EN = new BaseData(data.EN);
    } */

    toString(): string {
        let str = `### ${this.name}\n\n`;
        str += `#### ZH\n\n`;
        str += `${this.ZH.toString()}\n`;
        str += `#### EN\n\n`;
        str += `${this.EN.toString()}\n`;
        str += `#### Returns\n\n`;
        str += `${this.returns}\n\n`;
        return str;
    }

    getEmptydata() {
        let obj: any = {};
        if (this.ZH) {
            const _ZH = this.ZH.getEmptydata();
            if (_ZH)
                obj.ZH = _ZH;
        }
        if (this.EN) {
            const _EN = this.EN.getEmptydata();
            if (_EN)
                obj.EN = _EN;
        }
        if (!this.returns) {
            obj.returns = '';
        }
        if (Object.keys(obj).length === 0) {
            return null;
        }
        return obj;
    }

    writeEmptyData(data: any): void {
        if (data.returns) {
            this.returns = data.returns;
        }
        if (data.ZH) {
            this.ZH.writeEmptyData(data.ZH);
        }
        if (data.EN) {
            this.EN.writeEmptyData(data.EN);
        }
    }
}