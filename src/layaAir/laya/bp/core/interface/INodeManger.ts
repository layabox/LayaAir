import {TBPEventProperty, TBPVarProperty } from "../../datas/types/BlueprintTypes";

export interface INodeManger<T>{
    getNodeById(id:any):T;
    dataMap: Record<string, TBPVarProperty | TBPEventProperty>
}