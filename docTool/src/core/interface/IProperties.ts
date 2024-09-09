import { IBase } from "./IBase";

/**
* 
* @ brief: IProperties
* @ author: zyh
* @ data: 2024-04-23 15:32
*/
export interface IProperties {
    getEmptydata(): any;
    writeEmptyData(data: any): void;

    properties: IPropertiesData[];

    toString(): string;
}

export interface IPropertiesData {
    getEmptydata(): any;
    key: string;
    value: IPropertiesValue;

    toString(): string;
}

export interface IPropertiesValue extends IBase {
    writeEmptyData(data: any): void;
    getEmptydata(): any;
    data: IPropertiesValueDef;
    
    toString(): string;
}

export interface IPropertiesValueDef {
    type: string;
    default: string;
}