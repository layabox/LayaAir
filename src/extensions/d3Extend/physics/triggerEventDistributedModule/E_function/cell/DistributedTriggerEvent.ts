import { TriggerEvent } from "../../F_data/TriggerEvent"
import { TriggerQueueData } from "../../F_data/TriggerQueueData"
import { TriggerQueueDataPool } from "../../F_data/TriggerQueueDataPool"


export class DistributedTriggerEvent {
    /**
     * 感觉触发对派发事件
     * @param lastTriggerQueue 上一帧触发对列表会被修改
     * @param currentTriggerQueue 当前帧触发对列表不会被修改
     */
     distributedAllEvent(lastTriggerQueue:any,currentTriggerQueue:any)
    {
        for(var i in currentTriggerQueue)
        {
            var value:TriggerQueueData=lastTriggerQueue[i];
            if(value)
            {
                /**
                 * 派发事件：如果上一帧触发对列表中存在该触发对，则表示该触发对处于Stay状态
                 */
                console.log(currentTriggerQueue[i].thisBody.onlyID,currentTriggerQueue[i].thisBody.isStatic,currentTriggerQueue[i].otherBody.onlyID,currentTriggerQueue[i].otherBody.isStatic,"STAY");
                this.distributedEvent(TriggerEvent.TRIGGER_STAY,currentTriggerQueue[i]);
                TriggerQueueDataPool.instance.giveBack(value);
                /**
                 * 从上一针触发对列表中移除该触发对，为Exit状态做准备
                 */
                delete lastTriggerQueue[i];
            }
            else
            {
                console.log(currentTriggerQueue[i].thisBody.onlyID,currentTriggerQueue[i].thisBody.isStatic,currentTriggerQueue[i].otherBody.onlyID,currentTriggerQueue[i].otherBody.isStatic,"ENTER");
                /**
                 * 派发事件：如果上一帧触发对列表中不存在该触发对，则表示该触发对处于Enter状态
                 */
                this.distributedEvent(TriggerEvent.TRIGGER_ENTER,currentTriggerQueue[i]);
            }
        }
        for(var i in lastTriggerQueue)
        {
            var value:TriggerQueueData=lastTriggerQueue[i];
            console.log(value.thisBody.onlyID,value.thisBody.isStatic,value.otherBody.onlyID,value.otherBody.isStatic,"EXIT");
            /**
             * 派发事件：上一帧触发对列表中存在，但是当前帧列表中不存在的触发对，说明处于Exit状态
             */
            this.distributedEvent(TriggerEvent.TRIGGER_EXIT,value);

            TriggerQueueDataPool.instance.giveBack(value);
        }
    }
     distributedEvent(triggerEvent:string,queue:TriggerQueueData)
    {
        queue.thisBody.owner.event(triggerEvent,queue.otherBody);
        queue.otherBody.owner.event(triggerEvent,queue.thisBody);
    }
}


