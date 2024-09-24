import { IBase } from "./IBase";

/**
* 
* @ brief: ISelf
* @ author: zyh
* @ data: 2024-04-23 15:31
*/
export interface ISelf extends IBase {
    getEmptydata(): any;
    extends: string;

    toString(): string;
    writeEmptyData(data: any): void;
}