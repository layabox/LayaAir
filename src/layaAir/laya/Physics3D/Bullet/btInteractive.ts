import { btCollider } from "./Collider/btCollider";

export interface IPhyDebugDrawer{
    /**
     * 设置颜色
     * @param c 
     */
    color(c:number):void;
    /**
     * 画线
     * @param sx 
     * @param sy 
     * @param sz 
     * @param ex 
     * @param ey 
     * @param ez 
     */
    line(sx:number,sy:number,sz:number, ex:number, ey:number,ez:number):void;
    /**
     * 清除画线结果
     */
    clear():void;
}
/**
 * @internal
 */
export class BulletInteractive {
    mem:WebAssembly.Memory;
    dbgLine:IPhyDebugDrawer;
    /**
     * 
     * @param mem 
     * @param dbgline 如果要显示物理线框，要设置这个
     */
    constructor(mem:WebAssembly.Memory, dbgline:IPhyDebugDrawer){
        this.mem=mem;
        this.dbgLine=dbgline;
    }
    //Dynamic刚体,初始化时调用一次,Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
    getWorldTransform(rigidBodyID: number, worldTransPointer: number) {
    }
    //Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
    setWorldTransform(rigidBodyID: number, worldTransPointer: number) {
        var rigidBody = btCollider._physicObjectsMap[rigidBodyID];
        rigidBody._physicsManager._updatedRigidbodies++;
        rigidBody._updateTransformComponent(worldTransPointer);
    }

    drawLine=(sx: number, sy: number, sz: number, ex: number, ey: number, ez: number, color: number)=>{
        if(!this.dbgLine) return;
        this.dbgLine.color(color);
        this.dbgLine.line(sx,sy,sz,ex,ey,ez);
    }

    clearLine=()=>{
        if(!this.dbgLine) return;
        this.dbgLine.clear();
    }

    jslog=(ptr: number, len: number)=>{
        if(!this.mem) return;
        let td = new TextDecoder();
        let str = new Uint8Array(this.mem.buffer, ptr, len);
        let jsstr = td.decode(str);
        console.log(jsstr);
    }

}
