import { Laya } from "Laya";
import { CubePhysicsCompnent } from "../../CubePhysicsCompnent"
import { DistributedTriggerEvent } from "../E_function/cell/DistributedTriggerEvent"
import { TriggerStateDetection } from "../E_function/cell/TriggerStateDetection"


export class TriggerManager {
    private static _instance:TriggerManager;
     static get instance():TriggerManager {
        if (!TriggerManager._instance) {
            TriggerManager._instance = new TriggerManager();
        }
        return TriggerManager._instance;
    }

    private staticSprite3D:any;

    private dySprite3D:any;

     triggerStateDetection:TriggerStateDetection;

     distributedTriggerEvent:DistributedTriggerEvent;
    constructor(){
        this.staticSprite3D = {};
        this.dySprite3D = {};
        this.triggerStateDetection = new TriggerStateDetection();
        this.distributedTriggerEvent=new DistributedTriggerEvent();
        Laya.timer.frameLoop(1, this, this.detection)
    }

    private detection() {
        this.triggerStateDetection.allTriggerDetection(this.staticSprite3D, this.dySprite3D);

        this.distributedTriggerEvent.distributedAllEvent(this.triggerStateDetection.lastTriggerQueue, this.triggerStateDetection.triggerQueue);
    }

     addStatic(trigger:CubePhysicsCompnent) {
        this.staticSprite3D[trigger.onlyID] = trigger;
    }

     addDY(trigger:CubePhysicsCompnent) {
        this.dySprite3D[trigger.onlyID] = trigger;
    }

     removeStatic(trigger:CubePhysicsCompnent) {
        delete this.staticSprite3D[trigger.onlyID];
    }

     removeDY(trigger:CubePhysicsCompnent) {
        delete this.dySprite3D[trigger.onlyID];
    }
}


