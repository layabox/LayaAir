import { LayaGL } from "../layagl/LayaGL";
import { RenderStatisticsInfo } from "../RenderEngine/RenderEnum/RenderStatInfo";
import { IStatRender } from "./IStatRender";

/**
     * <p> <code>Stat</code> 是一个性能统计面板，可以实时更新相关的性能参数。</p>
     * <p>参与统计的性能参数如下（所有参数都是每大约1秒进行更新）：<br/>
     * FPS(WebGL)：WebGL 模式下的帧频，也就是每秒显示的帧数，值越高、越稳定，感觉越流畅；<br/>
     * Sprite：统计所有渲染节点（包括容器）数量，它的大小会影响引擎进行节点遍历、数据组织和渲染的效率。其值越小，游戏运行效率越高；<br/>
     * DrawCall：此值是决定性能的重要指标，其值越小，游戏运行效率越高。Canvas模式下表示每大约1秒的图像绘制次数；WebGL模式下表示每大约1秒的渲染提交批次，每次准备数据并通知GPU渲染绘制的过程称为1次DrawCall，在每次DrawCall中除了在通知GPU的渲染上比较耗时之外，切换材质与shader也是非常耗时的操作；<br/>
     * CurMem：Canvas模式下，表示内存占用大小，值越小越好，过高会导致游戏闪退；WebGL模式下，表示内存与显存的占用，值越小越好；<br/>
     * Shader：是 WebGL 模式独有的性能指标，表示每大约1秒 Shader 提交次数，值越小越好；<br/>
     * Canvas：由三个数值组成，只有设置 CacheAs 后才会有值，默认为0/0/0。从左到右数值的意义分别为：每帧重绘的画布数量 / 缓存类型为"normal"类型的画布数量 / 缓存类型为"bitmap"类型的画布数量。</p>
     */
export type StatUnit = "M" | "K" | "int";
export type StatColor = "yellow" | "white" | "red";
export type StatMode = "summit" | "average";

export interface StatUIParams {
    title: string,//显示title
    value: string,//对应Stat的数据
    color: StatColor,//显示颜色
    units: StatUnit,//"M"/"k"/"int"//显示单位
    mode: StatMode//"resource/average"//显示模式
}

export class Stat {
    //FPS
    public static FPSStatUIParams: StatUIParams = { title: "FPS(WebGL)", value: "_fpsStr", color: "yellow", units: "int", mode: "summit" };
    //Node nums
    public static NodeStatUIParams: StatUIParams = { title: "NodeNums", value: "spriteCount", color: "white", units: "int", mode: "summit" };
    //Sprite3D nums
    public static Sprite3DStatUIParams: StatUIParams = { title: "Sprite3D", value: "sprite3DCount", color: "white", units: "int", mode: "summit" };
    //DrawCall
    public static DrawCall: StatUIParams = { title: "DrawCall", value: "drawCall", color: "white", units: "int", mode: "average" };
    //triangleFace
    public static TriangleFace: StatUIParams = { title: "TriangleFace", value: "trianglesFaces", color: "white", units: "int", mode: "average" };
    //RenderNoe 渲染节点数量
    public static RenderNode: StatUIParams = { title: "RenderNode", value: "renderNode", color: "white", units: "int", mode: "summit" };
    //SkinRenderNode
    public static SkinRenderNode: StatUIParams = { title: "SkinRenderNode", value: "skinRenderNode", color: "white", units: "int", mode: "summit" };
    //ParticleRenderNode
    public static ParticleRenderNode: StatUIParams = { title: "ParticleRenderNode", value: "particleRenderNode", color: "white", units: "int", mode: "summit" };
    //FrustumCulling
    public static FrustumCulling: StatUIParams = { title: "FrustumCulling", value: "frustumCulling", color: "white", units: "int", mode: "average" };
    //uniformUpload
    public static UniformUpload: StatUIParams = { title: "UniformUpload", value: "uniformUpload", color: "white", units: "int", mode: "average" };
    //OpaqueDrawCall
    public static OpaqueDrawCall: StatUIParams = { title: "OpaqueDrawCall", value: "opaqueDrawCall", color: "white", units: "int", mode: "average" };
    //TransformDrawCall
    public static TransDrawCall: StatUIParams = { title: "TransDrawCall", value: "transDrawCall", color: "white", units: "int", mode: "average" };
    //DepthCastDrawCall
    public static DepthCastDrawCall:StatUIParams = {title: "DepthCastDrawCall", value: "depthCastDrawCall", color: "white", units: "int", mode: "average" };
    //InstanceDrawCall
    public static InstanceDrawCall: StatUIParams = { title: "InstanceDrawCall", value: "instanceDrawCall", color: "white", units: "int", mode: "average" };
    //CMDDrawCall
    public static CMDDrawCall: StatUIParams = { title: "CMDDrawCall", value: "cmdDrawCall", color: "white", units: "int", mode: "average" };
    //BlitDrawCall
    public static BlitDrawCall: StatUIParams = { title: "BlitDrawCall", value: "blitDrawCall", color: "white", units: "int", mode: "average" };
    //GPU 显存:
    public static GPUMemory: StatUIParams = { title: "GPUMemory", value: "gpuMemory", color: "white", units: "M", mode: "summit" };
    //Texture2D memory
    public static TextureMemeory: StatUIParams = { title: "TextureMemory", value: "textureMemory", color: "white", units: "M", mode: "summit" };
    //RenderTexture memory
    public static RenderTextureMemory: StatUIParams = { title: "RenderTextureMemory", value: "renderTextureMemory", color: "white", units: "M", mode: "summit" };
    //BufferMemory
    public static BufferMemory: StatUIParams = { title: "BufferMemory", value: "bufferMemory", color: "white", units: "M", mode: "summit" };

    public static AllShow: Array<StatUIParams> = [Stat.FPSStatUIParams, Stat.NodeStatUIParams, Stat.Sprite3DStatUIParams, Stat.DrawCall, Stat.TriangleFace, Stat.RenderNode, Stat.SkinRenderNode, Stat.ParticleRenderNode
        , Stat.FrustumCulling, Stat.OpaqueDrawCall, Stat.TransDrawCall,Stat.DepthCastDrawCall, Stat.InstanceDrawCall, Stat.CMDDrawCall, Stat.BlitDrawCall, Stat.GPUMemory, Stat.TextureMemeory, Stat.RenderTextureMemory, Stat.BufferMemory];
    public static memoryShow: Array<StatUIParams> = [Stat.GPUMemory, Stat.TextureMemeory, Stat.RenderTextureMemory, Stat.BufferMemory];
    public static renderShaow: Array<StatUIParams> = [Stat.DrawCall, Stat.TriangleFace, Stat.OpaqueDrawCall, Stat.TransDrawCall,Stat.DepthCastDrawCall, Stat.InstanceDrawCall, Stat.CMDDrawCall, Stat.BlitDrawCall];
    /** 每秒帧数。*/
    static FPS: number = 0;
    /**主舞台 <code>Stage</code> 渲染次数计数。 */
    static loopCount: number = 0;
    // /** 三角形面数。*/
    // static trianglesFaces: number = 0;
    /** 精灵<code>Sprite</code> 的数量。*/
    //static spriteCount: number = 0;
    /** 精灵渲染使用缓存<code>Sprite</code> 的数量。*/
    static spriteRenderUseCacheCount: number = 0;


    /** 画布 canvas 使用标准渲染的次数。*/
    static canvasNormal: number = 0;
    /** 画布 canvas 使用位图渲染的次数。*/
    static canvasBitmap: number = 0;
    /** 画布 canvas 缓冲区重绘次数。*/
    static canvasReCache: number = 0;
    /** 表示当前使用的是否为慢渲染模式。*/
    static renderSlow: boolean = false;
    /** 资源管理器所管理资源的累计内存,以字节为单位。*/
    //static gpuMemory: number;
    static cpuMemory: number;

    /**@internal */
    public static _canvasStr: string;
    /**@internal */
    public static _spriteStr: string;
    /**@internal */
    public static _fpsData: any[] = [];


    /**@internal */
    public static _timer: number = 0;
    /**@internal */
    public static _count: number = 0;

    /**@internal */
    public static _fpsStr: string = "";
    /**@internal */
    public static spriteCount: number = 0;//TODO
    /**@internal */
    public static sprite3DCount: number = 0;//TODO
    /**@internal */
    public static drawCall: number = 0;
    /**@internal */
    public static trianglesFaces: number = 0;
    /**@internal */
    public static renderNode: number = 0;
    /**@internal */
    public static skinRenderNode: number = 0;
    /**@internal */
    public static particleRenderNode: number = 0;
    /**@internal 视锥剔除次数。*/
    public static frustumCulling: number = 0;
    /**@internal */
    public static uniformUpload: number = 0;
    /**@internal */
    public static opaqueDrawCall: number = 0;
    /**@internal */
    public static transDrawCall: number = 0;
    /**@internal */
    public static depthCastDrawCall:number = 0;
    /**@internal */
    public static instanceDrawCall: number = 0;
    /**@internal */
    public static cmdDrawCall: number = 0;
    /**@internal */
    public static blitDrawCall: number = 0;
    /** 资源管理器所管理资源的累计内存,以字节为单位。*/
    public static gpuMemory: number;
    /**@internal */
    public static textureMemory: number = 0;
    /**@internal */
    public static renderTextureMemory: number = 0;
    /**@interanl */
    public static bufferMemory: number = 0;


    /**@internal*/
    static _StatRender: IStatRender;
    static _currentShowArray:Array<StatUIParams>;
    /**
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
     */
    static show(x: number = 0, y: number = 0, views: Array<StatUIParams> = Stat.AllShow): void {
        Stat._currentShowArray = views;
        Stat._StatRender.show(x, y, views);
    }

    /**
     * 设置自定义的Stat
     * @param stat 
     * @param value 
     */
    static setStat(stat: string, value: number) {
        if (!(Stat as any)[stat])
            (Stat as any)[stat] = 0;
        (Stat as any)[stat] += value;
    }


    /**激活性能统计*/
    static enable(): void {
        Stat._StatRender.enable();
    }

    /**
     * 隐藏性能统计信息。
     */
    static hide(): void {
        Stat._StatRender.hide();
    }

    static updateEngineData():void{
        
        Stat.trianglesFaces = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.Triangle);
        Stat.drawCall = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.DrawCall);
        Stat.instanceDrawCall = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.InstanceDrawCall);
        
        Stat.gpuMemory = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.GPUMemory);
        Stat.textureMemory = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.TextureMemeory);
        Stat.renderTextureMemory = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.RenderTextureMemory);
        Stat.bufferMemory = LayaGL.renderEngine.getStatisticsInfo(RenderStatisticsInfo.BufferMemory);
    }

    /**
     * @private
     * 清零性能统计计算相关的数据。
     */
    static clear(): void {
        if(!Stat._currentShowArray)
            return;
        Stat._currentShowArray.forEach(element => {
            if(element.mode=="average")
                (Stat as any)[element.value] = 0;
        });
        LayaGL.renderEngine.clearStatisticsInfo(RenderStatisticsInfo.Triangle);
        LayaGL.renderEngine.clearStatisticsInfo(RenderStatisticsInfo.DrawCall);
        LayaGL.renderEngine.clearStatisticsInfo(RenderStatisticsInfo.InstanceDrawCall);
    }

    /**
     * 点击性能统计显示区域的处理函数。
     */
    static set onclick(fn: Function) {
        Stat._StatRender.set_onclick(fn as any);
    }
}

