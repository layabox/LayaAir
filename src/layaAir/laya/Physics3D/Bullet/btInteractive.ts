import { btCollider } from "./Collider/btCollider";

export interface IPhyDebugDrawer{
    /**
     * @en Set the color.
     * @param c The color value.
     * @zh 设置颜色。
     * @param c 颜色值。
     */
    color(c:number):void;
    /**
     * @en Draw a line.
     * @param sx Start point x coordinate.
     * @param sy Start point y coordinate.
     * @param sz Start point z coordinate.
     * @param ex End point x coordinate.
     * @param ey End point y coordinate.
     * @param ez End point z coordinate.
     * @zh 绘制线段。
     * @param sx 起点 x 坐标。
     * @param sy 起点 y 坐标。
     * @param sz 起点 z 坐标。
     * @param ex 终点 x 坐标。
     * @param ey 终点 y 坐标。
     * @param ez 终点 z 坐标。
     */
    line(sx:number,sy:number,sz:number, ex:number, ey:number,ez:number):void;
    /**
     * @en Clear drawn lines.
     * @zh 清除画线结果。
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
     * @ignore
     * @en Creates an instance of BulletInteractive.
     * @param mem WebAssembly memory.
     * @param dbgline If you want to display physical lines, you need to set this.
     * @zh 创建一个 BulletInteractive 的实例。
     * @param mem WebAssembly 内存。
     * @param dbgline 如果要显示物理线框，要设置这个。
     */
    constructor(mem:WebAssembly.Memory, dbgline:IPhyDebugDrawer){
        this.mem=mem;
        this.dbgLine=dbgline;
    }
    /**
     * @en Dynamic physical body, called once when initialized, Kinematic physical body, called every physical tick (if not in sleep state), let the physical engine know the position of the body.
     * @param rigidBodyID The ID of the rigid body.
     * @param worldTransPointer Pointer to the world transform data.
     * @zh Dynamic刚体,初始化时调用一次,Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
     * @param rigidBodyID 刚体的 ID。
     * @param worldTransPointer 世界变换数据的指针。
     */
    getWorldTransform(rigidBodyID: number, worldTransPointer: number) {
    }
    /**
     * @en Dynamic physical body, the physical engine calls it once every frame, used to update the rendering matrix.
     * @param rigidBodyID The ID of the rigid body.
     * @param worldTransPointer Pointer to the world transform data.
     * @zh Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
     * @param rigidBodyID 刚体的 ID。
     * @param worldTransPointer 世界变换数据的指针。
     */
    setWorldTransform(rigidBodyID: number, worldTransPointer: number) {
        var rigidBody = btCollider._physicObjectsMap[rigidBodyID];
        rigidBody._physicsManager._updatedRigidbodies++;
        rigidBody._updateTransformComponent(worldTransPointer);
    }

    /**
     * @en Draw a debug line.
     * @param sx Start point x coordinate.
     * @param sy Start point y coordinate.
     * @param sz Start point z coordinate.
     * @param ex End point x coordinate.
     * @param ey End point y coordinate.
     * @param ez End point z coordinate.
     * @param color Line color.
     * @zh 绘制调试线段。
     * @param sx 起点 x 坐标。
     * @param sy 起点 y 坐标。
     * @param sz 起点 z 坐标。
     * @param ex 终点 x 坐标。
     * @param ey 终点 y 坐标。
     * @param ez 终点 z 坐标。
     * @param color 线段颜色。
     */
    drawLine=(sx: number, sy: number, sz: number, ex: number, ey: number, ez: number, color: number)=>{
        if(!this.dbgLine) return;
        this.dbgLine.color(color);
        this.dbgLine.line(sx,sy,sz,ex,ey,ez);
    }

    /**
     * @en Clear all debug lines.
     * @zh 清除所有调试线段。
     */
    clearLine=()=>{
        if(!this.dbgLine) return;
        this.dbgLine.clear();
    }

    /**
     * @en Log a message from WebAssembly to console.
     * @param ptr Pointer to the message string in WebAssembly memory.
     * @param len Length of the message string.
     * @zh 将 WebAssembly 中的消息记录到控制台。
     * @param ptr WebAssembly 内存中消息字符串的指针。
     * @param len 消息字符串的长度。
     */
    jslog=(ptr: number, len: number)=>{
        if(!this.mem) return;
        let td = new TextDecoder();
        let str = new Uint8Array(this.mem.buffer, ptr, len);
        let jsstr = td.decode(str);
        console.log(jsstr);
    }

}
