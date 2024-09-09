/**
* 
* @ brief: IBase
* @ author: zyh
* @ data: 2024-04-23 15:21
*/
export interface IBase {
    ZH:IBaseData;
    EN:IBaseData;

    toString(): string;
}

export interface IBaseData {
    writeEmptyData(data: any): void;
    getEmptydata(): any;
    name: string;
    describe: string;
    tips: string;
    param?: IBaseParam;

    toString(): string;
}

export interface IBaseParam {
    writeEmptyData(data: any): void;
    getEmptydata(): any;
    params:IBaseParamData[];
    toString(): string;
}

export interface IBaseParamData {
    key: string;
    value: string;
}