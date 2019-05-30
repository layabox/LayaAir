import { CubePhysicsCompnent } from "../../CubePhysicsCompnent"
export class TriggerQueueData {

     thisBody:CubePhysicsCompnent;
     otherBody:CubePhysicsCompnent;

    constructor(){
    }

    /**
     * 根据两个对象，生成key
     * @param thisBody
     * @param otherBody
     * @return
     */
     getKey():string {
        return this.thisBody.onlyID > this.otherBody.onlyID ? this.otherBody.onlyID + "_" + this.thisBody.onlyID : this.thisBody.onlyID+ "_" + this.otherBody.onlyID;
    }

     setBody(thisBody:CubePhysicsCompnent, otherBody:CubePhysicsCompnent) {
        this.thisBody = thisBody;
        this.otherBody = otherBody;
    }

}


