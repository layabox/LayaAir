// GPU 事件索引缓冲
// 由源系统 Update shader 写入，由接收系统 GPU Initialize shader 读取
buffer EventIndexBuffer
{
    uint count;       // 本帧产生的事件数量
    uint indices[];   // 源粒子在 AttributeBuffer 中的索引
}
GPUEvent;

// GPU 事件 DispatchIndirect 参数缓冲
// 由 PrepareDispatch shader 写入，作为 GPU Initialize 的 DispatchIndirect 参数
buffer GPUEventDispatchBuffer
{
    uint dispatchX;
    uint dispatchY;
    uint dispatchZ;
}
GPUEventDispatch;
