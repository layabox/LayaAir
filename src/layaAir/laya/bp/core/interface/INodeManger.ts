import { TBPConnType, TBPEventProperty, TBPVarProperty } from "../../datas/types/BlueprintTypes";
import { BlueprintPin } from "../BlueprintPin";

export interface INodeManger<T>{
    getNodeById(id:any):T;
    pendingLink(pin:BlueprintPin,config:TBPConnType):void;
    dataMap: Record<string, TBPVarProperty | TBPEventProperty>
}