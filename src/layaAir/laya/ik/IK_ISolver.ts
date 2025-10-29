import { Vector3 } from "../maths/Vector3";
import { IK_Chain } from "./IK_Chain";
import { IK_Target } from "./IK_Target";

// IK求解器接口
export interface IK_ISolver {
    // 要不要 maxIterations: number, tolerance: number 
    solve(chain: IK_Chain, targetPos: Vector3, endOffline:boolean ):void;
    maxIterations:number;
    dampingFactor:number;
    poleTarget:IK_Target;
    //setParameters(parsms:{[key:string]:any}):void;
    //getStatus():number;
}
