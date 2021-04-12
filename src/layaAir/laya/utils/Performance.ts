export class PerformancePlugin{
    /**@internal */
    static performanceTool:any = null;
    static _enable:boolean = false;
    
    public static PERFORMANCE_LAYA:string = "Laya";
    public static PERFORMANCE_LAYA_3D:string = "Laya/3D";
    public static PERFORMANCE_LAYA_2D:string = "Laya/2D";
    public static PERFORMANCE_LAYA_3D_PRERENDER:string = "Laya/3D/PreRender";
    public static PERFORMANCE_LAYA_3D_UPDATESCRIPT:string = "Laya/3D/UpdateScript";
    public static PERFORMANCE_LAYA_3D_PHYSICS:string = "Laya/3D/Physics";
    public static PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE:string = "Laya/3D/Physics/simulate";
    public static PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION:string = "Laya/3D/Physics/updataCharacters&Collisions";
    public static PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS:string = "Laya/3D/Physics/eventScripts";
    public static PERFORMANCE_LAYA_3D_RENDER:string = "Laya/3D/Render";
    public static PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP:string = "Laya/3D/Render/ShadowMap";
    public static PERFORMANCE_LAYA_3D_RENDER_CLUSTER:string = "Laya/3D/Render/Cluster";
    public static PERFORMANCE_LAYA_3D_RENDER_CULLING:string = "Laya/3D/Render/Culling";
    public static PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE = "Laya/3D/Render/RenderDepthMode";
    public static PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE:string = "Laya/3D/Render/RenderOpaque";
    public static PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER:string = "Laya/3D/Render/RenderCommandBuffer";
    public static PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT:string = "Laya/3D/Render/RenderTransparent";
    public static PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS:string = "Laya/3D/Render/PostProcess";
    
    
    static setPerformanceDataTool(tool:any){
      this.performanceTool = tool;
      //this.performanceTool.exportFrontNodeFn = this.exportFrameInfo;
    }
    //采样时间
    static begainSample(path:string){
        if(this.performanceTool)
        this.performanceTool.enable&&this.performanceTool.BegainSample(path);
    }

    static endSample(path:string):number{
        if(this.performanceTool)
        return this.performanceTool.enable?this.performanceTool.EndSample(path):0;
        else
        return 0;   
    }

    static expoertFile(path:string){
        if(this.performanceTool)
            return this.performanceTool.enable?this.performanceTool.exportPerformanceFile():null;
    }

    static showFunSampleFun(path:string){
        this.performanceTool.showFunSampleFun(path);
    }


    static set enable(value:boolean){
        if(this.performanceTool) { 
            this.performanceTool.enable = value; 
        }
     
    }

    static get enable():boolean{
        if(this.performanceTool)
        return this._enable;
        else
        return false;
    }
    static set enableDataExport(value:boolean){
        if(this.performanceTool) { 
            this.performanceTool.enableDataExport = value; 
        }
     
    }

    static get enableDataExport():boolean{
        if(this.performanceTool)
        return this.performanceTool.enableDataExport; 
        return false;
    }
}
(window as any).PerformancePlugin = PerformancePlugin;