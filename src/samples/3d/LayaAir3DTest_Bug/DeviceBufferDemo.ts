/**
description
 DeviceBuffer测试：验证readData和copyToBuffer接口,在屏幕上直观显示数据正确性
 */
import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { LayaGL } from "laya/layagl/LayaGL";
import { EDeviceBufferUsage, IDeviceBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { RenderCapable } from "laya/RenderEngine/RenderEnum/RenderCapable";

export class DeviceBufferDemo {
    private _logText: Text;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            this._initLogText();
            this._runTests();
        });
    }

    private _initLogText(): void {
        this._logText = new Text();
        this._logText.pos(20, 20);
        this._logText.width = 800;
        this._logText.fontSize = 18;
        this._logText.color = "#ffffff";
        this._logText.bgColor = "#333333";
        Laya.stage.addChild(this._logText);
    }

    private _log(msg: string): void {
        this._logText.text += msg + "\n";
    }

    private async _runTests(): Promise<void> {
        if (!LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)) {
            this._log("[ERROR] 当前环境不支持 ComputeShader，无法使用 DeviceBuffer");
            this._log("请使用支持 WebGPU 的浏览器运行此 Demo");
            return;
        }

        this._log("===== DeviceBuffer 接口测试 =====\n");

        await this._testSetDataAndReadData();
        //await this._testCopyToBuffer();
        //await this._testPartialCopy();

        this._log("\n===== 所有测试完成 =====");
    }

    /**
     * 测试1: setData 写入数据 + readData 读回验证
     *
     * readData 底层已内置 "copy src → staging + map_async" 流程，
     * 源 buffer 只需带 COPY_SRC，无需手动创建/拷贝到 MAP_READ buffer。
     */
    private async _testSetDataAndReadData(): Promise<void> {
        this._log("--- 测试1: setData + readData ---");

        const srcData = new Float32Array([1.0, 2.5, 3.14, 4.0, 5.5, 6.28, 7.0, 8.88]);
        const byteLength = srcData.byteLength; // 32 bytes

        const storageBuffer: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST
        );
        storageBuffer.setDataLength(byteLength);
        storageBuffer.setData(srcData.buffer, 0, 0, byteLength);

        const destData = new ArrayBuffer(byteLength);
        await storageBuffer.readData(destData, 0, 0, byteLength);
        const result = new Float32Array(destData);

        this._log("  写入数据: [" + Array.from(srcData).join(", ") + "]");
        this._log("  读回数据: [" + Array.from(result).join(", ") + "]");
        this._log("  结果: " + (this._compareArrays(srcData, result) ? "PASS ✓" : "FAIL ✗"));

        storageBuffer.destroy();
    }

    /**
     * 测试2: copyToBuffer 完整拷贝验证
     */
    private async _testCopyToBuffer(): Promise<void> {
        this._log("\n--- 测试2: copyToBuffer 完整拷贝 ---");

        const srcData = new Uint32Array([100, 200, 300, 400, 500, 600, 700, 800]);
        const byteLength = srcData.byteLength; // 32 bytes

        // Buffer A: 源
        const bufferA: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST
        );
        bufferA.setDataLength(byteLength);
        bufferA.setData(srcData.buffer, 0, 0, byteLength);

        // Buffer B: copyToBuffer 的目标
        const bufferB: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST
        );
        bufferB.setDataLength(byteLength);

        // A -> B
        bufferA.copyToBuffer(bufferB, 0, 0, byteLength);

        // staging 读回 B
        const readBuffer: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.MAP_READ | EDeviceBufferUsage.COPY_DST
        );
        readBuffer.setDataLength(byteLength);
        bufferB.copyToBuffer(readBuffer, 0, 0, byteLength);

        const destData = new ArrayBuffer(byteLength);
        await readBuffer.readData(destData, 0, 0, byteLength);
        const result = new Uint32Array(destData);

        this._log("  Buffer A 数据: [" + Array.from(srcData).join(", ") + "]");
        this._log("  A -> B 拷贝后, B 读回: [" + Array.from(result).join(", ") + "]");
        this._log("  结果: " + (this._compareArrays(srcData, result) ? "PASS ✓" : "FAIL ✗"));

        bufferA.destroy();
        bufferB.destroy();
        readBuffer.destroy();
    }

    /**
     * 测试3: copyToBuffer 偏移拷贝 (部分拷贝)
     */
    private async _testPartialCopy(): Promise<void> {
        this._log("\n--- 测试3: copyToBuffer 偏移/部分拷贝 ---");

        // 源数据 8个float
        const srcData = new Float32Array([10, 20, 30, 40, 50, 60, 70, 80]);
        const byteLength = srcData.byteLength; // 32 bytes

        const bufferA: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST
        );
        bufferA.setDataLength(byteLength);
        bufferA.setData(srcData.buffer, 0, 0, byteLength);

        // Buffer B 初始化为全0
        const zeroData = new Float32Array(8);
        const bufferB: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST
        );
        bufferB.setDataLength(byteLength);
        bufferB.setData(zeroData.buffer, 0, 0, byteLength);

        // 从A的offset=8(跳过前2个float) 拷贝 16字节(4个float) 到B的offset=12(从第4个float位置开始)
        // 即 A[2..5] => B[3..6]
        // A: [10, 20, |30, 40, 50, 60|, 70, 80]  sourceOffset=8, bytelength=16
        // B: [0, 0, 0, |30, 40, 50, 60|, 0]       destOffset=12
        bufferA.copyToBuffer(bufferB, 8, 12, 16);

        // staging 读回 B
        const readBuffer: IDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(
            EDeviceBufferUsage.MAP_READ | EDeviceBufferUsage.COPY_DST
        );
        readBuffer.setDataLength(byteLength);
        bufferB.copyToBuffer(readBuffer, 0, 0, byteLength);

        const destData = new ArrayBuffer(byteLength);
        await readBuffer.readData(destData, 0, 0, byteLength);
        const result = new Float32Array(destData);

        const expected = new Float32Array([0, 0, 0, 30, 40, 50, 60, 0]);

        this._log("  Buffer A 数据: [" + Array.from(srcData).join(", ") + "]");
        this._log("  拷贝: A[offset=8, 16bytes] -> B[offset=12]");
        this._log("  即 A 的第3~6个float 拷贝到 B 的第4~7个位置");
        this._log("  期望结果: [" + Array.from(expected).join(", ") + "]");
        this._log("  实际结果: [" + Array.from(result).join(", ") + "]");
        this._log("  结果: " + (this._compareArrays(expected, result) ? "PASS ✓" : "FAIL ✗"));

        bufferA.destroy();
        bufferB.destroy();
        readBuffer.destroy();
    }

    private _compareArrays(a: Float32Array | Uint32Array, b: Float32Array | Uint32Array): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
