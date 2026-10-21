/**
description
 使用官方 PBR 验证中间槽位为空：只绑定主颜色 0 和材质信息 3，法线 1、底色 2 不创建纹理。
 */
import { GBufferOutput } from "laya/d3/core/render/GBuffer";
import { MRT_Camera } from "./MRT_Camera";

/** 复用相机示例的创建、切换和销毁流程，初始即为两张纹理的稀疏布局。 */
export class MRT_Sparse extends MRT_Camera {
    constructor() {
        super(GBufferOutput.Surface, "05 / Sparse · 中间槽位为空");
    }
}
