export class TriggerQueueDataPool {
    private static _instance:TriggerQueueDataPool;

     pool:any[];
     point:number = 0;

    constructor(){
    }

     init(len:number) {
        this.pool = [];
        this.pool.length = len;
        for (var i = 0; i < len; i++) {
            if (!this.pool[i]) {
                this.pool[i] = new TriggerQueueData();
            }
        }
    }

     get():TriggerQueueData {
        this.point--;
        if (this.point == -1) {
            this.point = 0;
            return new TriggerQueueData();
        }
        else {
            return this.pool[this.point];
        }
    }

     giveBack(value:TriggerQueueData) {
        this.point++;
        if (this.point == this.pool.length) {
            this.pool.push(value);
        }
        else {
            this.pool[this.point] = value;
        }
    }

     static get instance():TriggerQueueDataPool {
        if (!TriggerQueueDataPool._instance) {
            TriggerQueueDataPool._instance = new TriggerQueueDataPool();
        }
        return TriggerQueueDataPool._instance;
    }
}


