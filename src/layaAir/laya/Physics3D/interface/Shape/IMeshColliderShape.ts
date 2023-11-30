import { Mesh } from "../../../d3/resource/models/Mesh";
import { IColliderShape } from "./IColliderShape";

export interface IMeshColliderShape extends IColliderShape {

    /**
     * create physicsMesh from Mesh
     * @param value 
     */
    setPhysicsMeshFromMesh(value: Mesh): void;

    /**
     * 
     * @param value 
     */
    setConvexMesh(value: Mesh): void;

    /**
     * create limit Vertex
     * @param limit 
     */
    setLimitVertex(limit: number): void;
}