import { PropertiesData } from "./PropertiesData";
import { IProperties, IPropertiesData } from "./interface/IProperties";

/**
 * 
 * @ brief: MDProperties
 * @ author: zyh
 * @ data: 2024-04-23 15:59
 */
export class MDProperties implements IProperties {
    properties: IPropertiesData[];

    /* constructor(data: IProperties) {
        this.properties = [];
        data.properties.forEach(element => {
            this.properties.push(new PropertiesData(element));
        });
    } */
    constructor() {
        this.properties = [];
    }

    addProperties(data: IPropertiesData) {
        this.properties.push(data);
    }

    getProperties(name: string): IPropertiesData {
        return this.properties.find((item) => {
            return item.key === name;
        });
    }

    toString(): string {
        let str = `## Properties\n\n`;
        this.properties.forEach((item) => {
            str += item.toString();
        });
        return str;
    }

    getEmptydata() {
        let properties = [];
        this.properties.forEach((item) => {
            const data = item.getEmptydata();
            if(data){
                data.key = item.key;
                properties.push(data);
            }
        });
        if(properties.length === 0){
            return null;
        }
        let obj: any = {};
        obj.properties = properties;
        return obj;
    }

    writeEmptyData(data: any): void {
        if(data.properties){
            data.properties.forEach((item: any) => {
                const property = this.getProperties(item.key);
                if(property){
                    property.value.writeEmptyData(item.value);
                }
            });
        }
    }
}