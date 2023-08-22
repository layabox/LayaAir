import { Mesh } from "../../../d3/resource/models/Mesh";
import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "./IColliderShape";

export interface IMeshColliderShape extends IColliderShape {
    //TODO
    
    /**
     * create physicsMesh from Mesh
     * @param value 
     */
    createPhysicsMeshFromMesh(value: Mesh): any;
}