import { CubePhysicsCompnent } from "../../../CubePhysicsCompnent"
import { TriggerQueueData } from "../../F_data/TriggerQueueData"
import { TriggerQueueDataPool } from "../../F_data/TriggerQueueDataPool"

export class TriggerStateDetection {

    private _lastTriggerQueue:any;

    private _triggerQueue:any;

    constructor(){
        this._lastTriggerQueue = {};
        this._triggerQueue = {};
        TriggerQueueDataPool.instance.init(100);
    }

    /**
     * 将两个列表中的数据都进行触发检测
     * @param staticSprite3DQueue
     * @param dynamicSprite3DQueue
     */
     allTriggerDetection(staticSprite3DQueue:any, dynamicSprite3DQueue:any) {
        this._lastTriggerQueue = this._triggerQueue;
        this._triggerQueue = {};
        if (!dynamicSprite3DQueue) {
            return;
        }
        for(var i in dynamicSprite3DQueue)
        {
            var body:CubePhysicsCompnent= dynamicSprite3DQueue[i];
            body.isDetection = false;
        }
        for(var i in dynamicSprite3DQueue)
        {
            var body:CubePhysicsCompnent= dynamicSprite3DQueue[i];
            for(var j in staticSprite3DQueue)
            {
                this.singleTriggerDetection(body, staticSprite3DQueue[j]);
            }
            for(var k in dynamicSprite3DQueue)
            {
                var target:CubePhysicsCompnent = dynamicSprite3DQueue[k];
                if(!target.isDetection)
                {
                    this.singleTriggerDetection(body,target);
                }
            }
            body.isDetection = true;
        }
    }

    /**
     * 对两个对象进行碰撞检测
     * @param thisBody
     * @param otherBody
     */
    private singleTriggerDetection(thisBody:CubePhysicsCompnent, otherBody:CubePhysicsCompnent) {
        if(thisBody.onlyID!=otherBody.onlyID)
        {
            var isTrigger:boolean = thisBody.isCollision(otherBody);
            if (isTrigger) {
                var data:TriggerQueueData = TriggerQueueDataPool.instance.get();
                data.setBody(thisBody,otherBody);
                var key:string = this.getKey(thisBody,otherBody);
                this._triggerQueue[key] = data;
            }
        }
    }
    /**
     * 根据两个对象，生成key
     * @param thisBody
     * @param otherBody
     * @return
     */
    private getKey(thisBody:CubePhysicsCompnent, otherBody:CubePhysicsCompnent):string {
        return thisBody.onlyID > otherBody.onlyID ? otherBody.onlyID + "_" + thisBody.onlyID : thisBody.onlyID+ "_" + otherBody.onlyID;
    }

     get lastTriggerQueue():any {
        return this._lastTriggerQueue;
    }

     get triggerQueue():any {
        return this._triggerQueue;
    }
}


