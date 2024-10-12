import { IMethods } from "./IMethods";
import { IProperties } from "./IProperties";
import { ISelf } from "./ISelf";

/**
* 
* @ brief: IClass
* @ author: zyh
* @ data: 2024-04-23 15:41
*/
export interface IClass {
    className: string;
    seft: ISelf;
    properties: IProperties;
    methods: IMethods;

    toString(): string;
}