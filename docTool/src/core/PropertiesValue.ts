import { BaseData } from "./BaseData";
import { IBaseData } from "./interface/IBase";
import { IPropertiesValue, IPropertiesValueDef } from "./interface/IProperties";

/**
 * 
 * @ brief: PropertiesValue
 * @ author: zyh
 * @ data: 2024-04-23 16:02
 */
export class PropertiesValue implements IPropertiesValue {
    data: IPropertiesValueDef;
    ZH: IBaseData;
    EN: IBaseData;

    /* constructor(data: IPropertiesValue) {
        this.data = data.data;
        this.ZH = new BaseData(data.ZH);
        this.EN = new BaseData(data.EN);
    } */

    setDef(type: string, defaultVal: string) {
        if (this.data) {
            this.data.type = type;
            if (defaultVal) {
                this.data.default = defaultVal;
            }
        } else {
            this.data = { type, default: defaultVal };
        }
    }


    toString(): string {
        let str = `#### Data\n\n`;
        str += `- type: ${this.data.type}\n`;
        str += `- default: ${this.data.default}\n\n`;
        str += `#### ZH\n\n`;
        str += `${this.ZH.toString()}\n\n`;
        str += `#### EN\n\n`;
        str += `${this.EN.toString()}\n\n\n\n`;
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
        if (!this.data.default) {
            obj.data = {
                default: ''
            };
        }
        if (Object.keys(obj).length === 0) {
            return null;
        }
        return obj;
    }

    writeEmptyData(data: any): void {
        if (this.data && data.data && data.data.default) {
            this.data.default = data.data.default;
        }
        if (data.ZH) {
            this.ZH.writeEmptyData(data.ZH);
        }
        if (data.EN) {
            this.EN.writeEmptyData(data.EN);
        }
    }
}