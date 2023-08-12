import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

export interface IStaticCollider extends ICollider {
    /**
     * set trigger
     * @param value 
     */    
    setTrigger(value:boolean):void;

}