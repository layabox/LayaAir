import { IClass } from "./interface/IClass";
import { IMethods } from "./interface/IMethods";
import { IProperties } from "./interface/IProperties";
import { ISelf } from "./interface/ISelf";

/**
 * 
 * @ brief: MDClass
 * @ author: zyh
 * @ data: 2024-04-23 15:15
 */
export class MDClass implements IClass {
    className: string;
    seft: ISelf;
    properties: IProperties;
    methods: IMethods;

    toString(): string {
        let str = `# ${this.className}\n\n`;

        if (this.seft)
            str += this.seft.toString();

        if (this.properties)
            str += this.properties.toString();

        if (this.methods)
            str += this.methods.toString();
        return str;
    }

    getEmptydata() {
        let obj: any = {};

        if (this.seft){
            const _seft = this.seft.getEmptydata();
            if (_seft)
                obj.seft = _seft;
        }

        if (this.properties){
            const _properties = this.properties.getEmptydata();
            if (_properties)
                obj.properties = _properties;
        }

        if (this.methods){
            const _methods = this.methods.getEmptydata();
            if (_methods)
                obj.methods = _methods;
        }

        if(Object.keys(obj).length === 0){
            return null;
        }
        
        return obj;
    }

    writeEmptyData(data: any) {
        for (const key in data) {
            if (this[key]) {
                this[key].writeEmptyData(data[key]);
            }
        }
    }
}