import { IBase } from "./IBase";

/**
* 
* @ brief: IMethods
* @ author: zyh
* @ data: 2024-04-23 15:38
*/
export interface IMethods {
    getEmptydata(): any;
    writeEmptyData(data: any): void;

    methods: IMethodsData[];

    toString(): string;
}

export interface IMethodsData extends IBase {
    writeEmptyData(data: any): void;
    getEmptydata(): any;
    name: string;
    returns:string;
}