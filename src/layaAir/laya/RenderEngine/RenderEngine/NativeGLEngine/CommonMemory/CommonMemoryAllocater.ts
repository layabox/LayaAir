/**
 * 共享内存分配,并且绑定Native共享Buffer
 */
export class CommonMemoryAllocater{
    
    /**
     * 创建内存，并绑定为共享内存
     * @param size 
     * @returns 
     */
    static creatBlock(size:number):ArrayBuffer{
        const buffer = new ArrayBuffer(size);
        
        //native bind todo:
        //buffer.nativeid = ??
        return buffer;
    }

    /**
     * 释放共享内存
     * @param buffer 
     */
    static freeMemoryBlock(buffer:ArrayBuffer){
        //TODO native free buffer
        buffer = null;
    }
    
    
    
}