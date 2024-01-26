import { WebGPUEngine } from "./WebGPUEngine";

/**
 * WebGPUObject基类
 */
export class WebGPUObject{
    protected _engine:WebGPUEngine;
    protected _device:GPUDevice;
    protected _context:GPUCanvasContext;
    protected _id:number;
    protected _destroyed:boolean = false;
    /**
     * instance one WebGPU Object
     * @param engine 
     */
    constructor(engine:WebGPUEngine){
        this._engine = engine;
        this._context = this._engine._context;
        this._id = this._engine._IDCounter++;
        this._device = this._engine._device;
    }

    /**
     * get destroyed state
     */
    get destroyed():boolean{
        return this._destroyed;
    }

    /**
     * destroy
     * @override
     * @returns 
     */
    destroy():void{
        if (this._destroyed) return;
        this._destroyed = true;
    }
}