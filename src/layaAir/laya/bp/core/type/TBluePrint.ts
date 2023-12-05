import { BPType } from "../../datas/types/BlueprintTypes";
// import { EBlueNodeType } from "../EBluePrint"

export type TBPNodeDef = {
    name: string,
    id: string,
    type: BPType,
    inPut?: TBPPinDef[],
    outPut?: TBPPinDef[],
    fun?: Function
}

export type TBPPinDef = {
    name: string,
    type: string
}


export type TBPNodeData = {
    id: string,
    did: string,
    data: Record<string, TBPPinData>
}

export type TBPLinkInfo = {
    varname:string;
}

export type TBPPinData = {
    value?: any;
    //格式 id:name:pinindex
    linkto?: string[];
}
