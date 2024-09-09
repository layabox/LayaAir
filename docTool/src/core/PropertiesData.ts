import { PropertiesValue } from "./PropertiesValue";
import { IPropertiesData, IPropertiesValue } from "./interface/IProperties";

/**
 * 
 * @ brief: PropertiesData
 * @ author: zyh
 * @ data: 2024-04-23 16:01
 */
export class PropertiesData implements IPropertiesData {
    key: string;
    value: IPropertiesValue;

    /* constructor(data: IPropertiesData) {
        this.key = data.key;
        this.value = new PropertiesValue(data.value);
    } */

    toString(): string {
        let str = `### ${this.key}\n\n`;
        str += this.value.toString();
        return str;
    }

    getEmptydata() {
        let obj: any = {};
        const data = this.value.getEmptydata();
        if (data) {
            obj.key = this.key;
            obj.value = data;
        }
        if (Object.keys(obj).length === 0) {
            return null;
        }
        return obj;
    }
}