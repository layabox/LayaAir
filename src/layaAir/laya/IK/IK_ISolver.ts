import { IK_Chain } from "./IK_Chain";
import { IK_Target } from "./IK_Pose1";

// IK求解器接口
export interface IK_ISolver {
    // 要不要 maxIterations: number, tolerance: number 
    solve(chain: IK_Chain, target: IK_Target ): void;
}
