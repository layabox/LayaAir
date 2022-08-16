import { ILaya } from "../../../../ILaya";
import { ILaya3D } from "../../../../ILaya3D";
import { Vector3 } from "../../math/Vector3";
import { ColliderShape } from "./ColliderShape";

/**
 * <code>BoxColliderShape</code> 类用于创建高度图地形形状碰撞器。
 * 
 */
export class HeightfieldTerrainShape extends ColliderShape {
    dataPtr = 0;
    initSize = new Vector3();

    constructor(heightfieldData: Uint16Array | Float32Array | Uint8Array, heightStickWidth: number, heightStickLength: number, minHeight: number, maxHeight: number, heightScale: number) {
        super();
        this._type = ColliderShape.SHAPETYPES_HEIGHTFIELDTERRAIN;
        var bt: any = ILaya3D.Physics3D._bullet;
        this.needsCustomCollisionCallback = true;
        let hfdatatype = 5; //PHY_UCHAR
        if (heightfieldData instanceof Uint16Array) {
            hfdatatype = 3;	//PHY_SHORT
        } else if (heightfieldData instanceof Uint8Array) {
            hfdatatype = 5;	//PHY_UCHAR
        } else if (heightfieldData instanceof Float32Array) {
            hfdatatype = 0;	//PHY_FLOAT
        } else {
            throw 'bad heightfield data';
        }

        this.dataPtr = bt._malloc(heightfieldData.byteLength);
        // 拷贝数据
        let conch = (window as any).conch;
        if (conch) {
            bt.copyJSArray(this.dataPtr, heightfieldData.buffer);
        } else {
            let bulletwasm = ILaya.Laya.WasmModules['bullet'];
            let buff = bulletwasm.memory.buffer;
            let dstbuff = new Uint8Array(buff, this.dataPtr, heightfieldData.byteLength);
            // 拷贝数据
            dstbuff.set(new Uint8Array(heightfieldData.buffer));
        }
        /*
        PHY_FLOAT,			0
        //PHY_DOUBLE,		1
        //PHY_INTEGER,		2
        PHY_SHORT,			3
        //PHY_FIXEDPOINT88,	4
        PHY_UCHAR			5
        */

        this._btShape = bt.btHeightfieldTerrainShape_create(heightStickWidth, heightStickLength, this.dataPtr, heightScale, minHeight, maxHeight, hfdatatype);
    }
    /**
    * 设置地形的margin
    * margin有助于提高稳定性
    * @param margin 
    */
    setMargin(margin: number) {
        var bt: any = ILaya3D.Physics3D._bullet;
        bt.btConcaveShape_setMargin(this._btShape, margin);
    }
    /**
     * @internal
     */
    _setScale(value: Vector3): void {
        super._setScale(value);
    }

    destroy() {
        super.destroy();
        if (this.dataPtr) {
            var bt: any = ILaya3D.Physics3D._bullet;
            bt._free(this.dataPtr);
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    clone(): any {
        debugger;
        throw 'not imp'
    }
}


