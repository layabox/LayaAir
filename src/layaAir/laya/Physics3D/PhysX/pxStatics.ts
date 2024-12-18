/** @internal */
export class pxStatics {
    // /** @internal PhysX Foundation SDK singleton class */
    static _foundation: any;
    //** @internal PhysX wasm object */
    static _physX: any;
    // /** @internal PhysX physics object */
    static _physics: any;

    static _physXPVD: boolean = false;
    static _PxPvdPort: any = 5425;

    static _pvd: any;
    static _PxPvdTransport: any;
    static _physXSimulationCallbackInstance: any;
    static _sceneDesc: any;

    static _allocator: any;
    static _tolerancesScale: any;

    /**
     * @en Create a Float32Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Float32Array。
     * @param length 数组的长度。
     */
    static createFloat32Array(length: number): { ptr: number, buffer: Float32Array } {
        let ptr = pxStatics._physX._malloc(4 * length);
        const buffer = new Float32Array(pxStatics._physX.HEAPF32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }

    /**
     * @en Create a Uint32Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint32Array。
     * @param length 数组的长度。
     */
    static createUint32Array(length: number): { ptr: number, buffer: Uint32Array } {
        let ptr = pxStatics._physX._malloc(4 * length);
        const buffer = new Uint32Array(pxStatics._physX.HEAPU32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Create a Uint16Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint16Array。
     * @param length 数组的长度。
     */
    static createUint16Array(length: number): { ptr: number, buffer: Uint16Array } {
        let ptr = pxStatics._physX._malloc(2 * length);
        const buffer = new Uint16Array(pxStatics._physX.HEAPU16.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Create a Uint8Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint8Array。
     * @param length 数组的长度。
     */
    static createUint8Array(length: number): { ptr: number, buffer: Uint8Array } {
        let ptr = pxStatics._physX._malloc(length);
        const buffer = new Uint8Array(pxStatics._physX.HEAPU8.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Free the allocated memory for a buffer.
     * @param data The buffer object to free.
     * @zh 释放为缓冲区分配的内存。
     * @param data 要释放的缓冲区对象。
     */
    static freeBuffer(data: any) {
        pxStatics._physX._free(data.ptr);
    }
}

export enum partFlag {

    eSOLVE_CONTACT = (1 << 0),  // Dynamic中刚体触发碰撞
    eMODIFY_CONTACTS = (1 << 1),    // Dynamic中刚体碰撞需要修改碰撞
    eNOTIFY_TOUCH_FOUND = (1 << 2), // 
    eNOTIFY_TOUCH_PERSISTS = (1 << 3),//
    eNOTIFY_TOUCH_LOST = (1 << 4),  //
    eNOTIFY_TOUCH_CCD = (1 << 5),   //
    eNOTIFY_THRESHOLD_FORCE_FOUND = (1 << 6),   //
    eNOTIFY_THRESHOLD_FORCE_PERSISTS = (1 << 7),    //
    eNOTIFY_THRESHOLD_FORCE_LOST = (1 << 8),    //
    eNOTIFY_CONTACT_POINTS = (1 << 9),  //
    eDETECT_DISCRETE_CONTACT = (1 << 10),   //
    eDETECT_CCD_CONTACT = (1 << 11),    //
    ePRE_SOLVER_VELOCITY = (1 << 12),   //
    ePOST_SOLVER_VELOCITY = (1 << 13),  //
    eCONTACT_EVENT_POSE = (1 << 14),    //
    eNEXT_FREE = (1 << 15),        //!< For internal use only.  //
    eCONTACT_DEFAULT = eSOLVE_CONTACT | eDETECT_DISCRETE_CONTACT,   // 默认碰撞标志
    eTRIGGER_DEFAULT = eNOTIFY_TOUCH_FOUND | eNOTIFY_TOUCH_LOST | eDETECT_DISCRETE_CONTACT  // 默认触发标志
};