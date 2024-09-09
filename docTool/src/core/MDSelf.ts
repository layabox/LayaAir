import { BaseData } from "./BaseData";
import { IBaseData } from "./interface/IBase";
import { ISelf } from "./interface/ISelf";

/**
 * 
 * @ brief: MDSelf
 * @ author: zyh
 * @ data: 2024-04-23 15:47
 */
export class MDSelf implements ISelf {
    extends: string;
    ZH: IBaseData;
    EN: IBaseData;

    /* constructor(data: ISelf) {
        this.extends = data.extends;
        this.ZH = new BaseData(data.ZH);
        this.EN = new BaseData(data.EN);
    } */

    toString(): string {
        let str = `## self\n\n`;
        str += `#### extends\n\n`;
        str += `extends ${this.extends || ''}\n\n`;
        str += `#### ZH\n\n`;
        str += `${this.ZH.toString()}\n\n`;
        str += `#### EN\n\n`;
        str += `${this.EN.toString()}\n\n\n\n`;
        return str;
    }

    getEmptydata() {
        let obj:any = {}
        if (this.ZH){
            const _ZH = this.ZH.getEmptydata();
            if (_ZH)
                obj.ZH = _ZH;
        }
        if (this.EN){
            const _EN = this.EN.getEmptydata();
            if (_EN)
                obj.EN = _EN;
        }
        if(!this.extends){
            obj.extends = '';
        }

        if(Object.keys(obj).length === 0){
            return null;
        }
        return obj;
    }

    writeEmptyData(data: any): void {
        if (data.extends) {
            this.extends = data.extends;
        }
        if (data.ZH) {
            this.ZH.writeEmptyData(data.ZH);
        }
        if (data.EN) {
            this.EN.writeEmptyData(data.EN);
        }
    }
}