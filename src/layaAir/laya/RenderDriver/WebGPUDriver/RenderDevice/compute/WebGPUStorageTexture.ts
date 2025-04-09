// import { WebGPUDevice } from '../WebGPUDevice';

// export class WebGPUStorageTexture {
//     private device: WebGPUDevice;
//     private texture: GPUTexture | null = null;
//     private width: number = 0;
//     private height: number = 0;
//     private format: GPUTextureFormat = 'rgba8unorm';

//     constructor(device: WebGPUDevice) {
//         this.device = device;
//     }

//     /**
//      * 创建存储纹理
//      * @param width 纹理宽度
//      * @param height 纹理高度
//      * @param format 纹理格式
//      */
//     public create(width: number, height: number, format: GPUTextureFormat = 'rgba8unorm'): void {
//         this.width = width;
//         this.height = height;
//         this.format = format;

//         this.texture = this.device.device.createTexture({
//             size: [width, height],
//             format: format,
//             usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC
//         });
//     }

//     /**
//      * 设置纹理数据
//      * @param data 要设置的数据
//      */
//     public setData(data: ArrayBuffer): void {
//         if (!this.texture) {
//             throw new Error('Texture not created');
//         }

//         const bytesPerRow = this.width * 4; // 假设使用RGBA格式
//         const alignedBytesPerRow = Math.ceil(bytesPerRow / 256) * 256;

//         this.device.device.queue.writeTexture(
//             { texture: this.texture },
//             data,
//             { bytesPerRow: alignedBytesPerRow, rowsPerImage: this.height },
//             [this.width, this.height]
//         );
//     }

//     /**
//      * 读取纹理数据
//      * @returns Promise<ArrayBuffer> 读取的数据
//      */
//     public async readData(): Promise<ArrayBuffer> {
//         if (!this.texture) {
//             throw new Error('Texture not created');
//         }

//         const bytesPerRow = this.width * 4;
//         const alignedBytesPerRow = Math.ceil(bytesPerRow / 256) * 256;
//         const bufferSize = alignedBytesPerRow * this.height;

//         const readbackBuffer = this.device.device.createBuffer({
//             size: bufferSize,
//             usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
//         });

//         const commandEncoder = this.device.device.createCommandEncoder();
//         commandEncoder.copyTextureToBuffer(
//             { texture: this.texture },
//             { buffer: readbackBuffer, bytesPerRow: alignedBytesPerRow },
//             [this.width, this.height]
//         );
//         this.device.device.queue.submit([commandEncoder.finish()]);

//         await readbackBuffer.mapAsync(GPUMapMode.READ);
//         const data = readbackBuffer.getMappedRange();
//         readbackBuffer.unmap();

//         return data!;
//     }

//     /**
//      * 获取纹理
//      * @returns GPUTexture
//      */
//     public getTexture(): GPUTexture {
//         if (!this.texture) {
//             throw new Error('Texture not created');
//         }
//         return this.texture;
//     }
// } 