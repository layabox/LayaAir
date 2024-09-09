import { MethodsData } from "./MethodsData";
import { IMethods, IMethodsData } from "./interface/IMethods";

/**
 * 
 * @ brief: MDMethods
 * @ author: zyh
 * @ data: 2024-04-23 16:08
 */
export class MDMethods implements IMethods {
    methods: IMethodsData[];

    /* constructor(data: IMethods) {
        this.methods = []
        data.methods.forEach((element) => {
            this.methods.push(new MethodsData(element));
        });
    } */
    constructor() {
        this.methods = [];
    }

    addMethods(data: IMethodsData) {
        this.methods.push(data);
    }

    getMethods(name: string): IMethodsData {
        return this.methods.find((item) => {
            return item.name === name;
        });
    }

    toString(): string {
        let str = `## Methods\n\n`;
        this.methods.forEach((method) => {
            str += method.toString();
        });
        return str;
    }

    getEmptydata() {
        let methods = [];
        this.methods.forEach((item) => {
            const data = item.getEmptydata();
            if (data){
                data.name = item.name;
                methods.push(data);
            }
        });
        if (methods.length === 0) {
            return null;
        }
        let obj: any = {};
        obj.methods = methods;
        return obj;
    }

    writeEmptyData(data: any): void {
        if (data.methods) {
            data.methods.forEach((item: any) => {
                const method = this.getMethods(item.name);
                if (method) {
                    method.writeEmptyData(item);
                }
            });
        }
    }
}