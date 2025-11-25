import { ClassUtils } from "../utils/ClassUtils";
import { BoneConstraints } from "./BoneConstraints";
import { BoneData, IK_ChainData } from "./IK_ChainData";
import { IK_Comp } from "./IK_Comp";
import { IK_ConstraintData } from "./IK_ConstraintData";

let c = ClassUtils.regClass;
c('IK_Comp', IK_Comp);
c('IK_ChainData', IK_ChainData);
c('IK_ConstraintData', IK_ConstraintData);
c('BoneConstraints', BoneConstraints)
c('BoneData',BoneData)