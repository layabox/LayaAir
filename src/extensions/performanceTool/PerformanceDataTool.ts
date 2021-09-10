import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Byte } from "laya/utils/Byte";
import { Stat } from "laya/utils/Stat";
import ProfileHelper from "./ProfileHelper";

/**
 * 性能分析数据工具
 */
export class PerformanceDataTool{
    public static VERSION:string = "PERFORMANCEDATA:01";
    public static instance:PerformanceDataTool = new PerformanceDataTool();

    public static PERFORMANCE_DELTYTIME:string = "deltyTime";
    public static PERFORMANCE_STARTTIME:string = "startTime";

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
    
    /**数据保存路径 */
    public static exportPath:string;
    //TODO:判断是否支持
    private static _surpport:boolean = false;
    
    /**是否开启性能数据保存*/
    private _enable:boolean = false;
    /**TODO判断是否有支持性能分析工具*/
    private _startFram:number;
    /**操作数据 */
    private _runtimeNode:PerforManceNode;
    //索引map
    private _AllPathMap:{[key:string]:number} = {};
    //自定义颜色map
    private _pathColor:{[key:string]:number[]} = {};
    //统计数据数量
    private _pathCount:number = 0;
    //简单数据表现 实时
    private _runtimeShowPathIndex:number = -1;
    
    /**数据集合 */
    _nodeList:PerforManceNode[] = [];
    /**采样步长 时间是1的话就是每帧都会有数据，不是1的话就会取samplerFrameStep帧数的平均值*/
    samplerFramStep:number = 6;
    /**Memory格式的数据 */
    _memoryDataMap:{[key:string]:number} = {};

    public _sp: Sprite;
    public pointArray: any[] = [];
    public fpsArray: any[] = [];
    // 显示宽度
    public static DrawWidth: number = 250;
    // 显示高度
    public static DrawHeight: number = 250;
    // 数据数量
    public static readonly StepLength: number = 250;

    public static stepLengthArrayMap:Array<Array<number>> = new Array();


    /**
     * 数据中存入Laya引擎自身的检测数据
     */
     static InitLayaPerformanceInfo(){
        PerformanceDataTool.instance.InitLayaPerformanceInfo();
    }
    public InitLayaPerformanceInfo() {
        
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_2D,[255,128,128,255]);//pick
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D,[255,255,128,255]);//yellow
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER,[128,255,128,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_UPDATESCRIPT,[128,255,255,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS,[0,128,255,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE,[255,0,0,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION,[255,128,0,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS,[128,0,0,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER,[64,128,128,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP,[192,192,192,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CLUSTER,[128,64,64,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CULLING,[0,64,128,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE,[128,0,64,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE,[128,0,255,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER,[128,128,64,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT,[128,0,255,255]);
        this.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS,[0,255,0,255]);
    }
    set enable(value:boolean){
        if(value){
            this._startFram = Stat.loopCount;
            this.resetReCordData();
            //加入stage
            this._sp = new Sprite();
            this._sp.pos(0, 400).zOrder = 99;
            Laya.stage.addChild(this._sp);
        }
        else{
            Laya.stage.removeChild(this._sp);
        }
        this._enable = value;
    }

    get enable():boolean{
        return this._enable;
    }
    private _enableDataExport:boolean;
    get enableDataExport():boolean{
        return this._enableDataExport;
    } 
    set enableDataExport(value:boolean){
        if(value){ 
            ProfileHelper.init('player', this);
            ProfileHelper.enable = value;  
            //开启性能数据传输,自动设置为1
            this.samplerFramStep = 1;
        }
        else{ 
            ProfileHelper.enable = value;
        }
        this._enableDataExport = value;
    }
    public static setDataExportHost(host: string) {
        ProfileHelper.Host = host;
    }

    set runtimeShowPath(path:string){
        let showPathIndex = this._AllPathMap[path];
        for(let i in this.pointArray){
           delete this.pointArray[i] ;
           delete PerformanceDataTool.stepLengthArrayMap[i];
        }
        if(showPathIndex != null)
            this._runtimeShowPathIndex = showPathIndex;
        else
            this._runtimeShowPathIndex = -1;
    }


    constructor(){

    }

    /**
     * 获得节点索引
     * @param path 
     * @returns 
     */
    public getNodePathIndex(path:string):number{
        var id;
        if(this._AllPathMap[path]!=null)
            id = this._AllPathMap[path];
        else{ 
            id = this._pathCount++;
            this._AllPathMap[path] = id;
            ProfileHelper.sendConfigData(this.getPathInfo());
        }
        return id;
    }

    /**
     * 只获得路径  路径颜色数据
     */
    public getPathInfo():any{
        let pathInfo = {};
        // 如果路径颜色未初始化
        if (Object.keys(this._pathColor).length == 0) {
            this.InitLayaPerformanceInfo();
        }
        pathInfo["_pathColor"] = this._pathColor;
        pathInfo["_AllPathMap"] = this._AllPathMap;
        return pathInfo;
    }



    /**
     * 输出所有调试数据为ArrayBuffer
     */
    exportPerformanceFile(fromProfiler: boolean = false){
        PerformanceDataTool.InitLayaPerformanceInfo();
        if (!fromProfiler) { 
            // 从性能分析器调用时，不可设置enable
            this.enable = false;
        }
        //TODO:输出数据导出
        let blockstr:string[] = [];
        let blockStart:number[] = [];
        let blocklength:number[] = [];
        let tempNum = 0;
        let blockStartPos:number;
        let tempStartPos:number;
        let tempEndPos:number;
        let dataByte = new Byte();
        dataByte.pos = 0;
        //version
        dataByte.writeUTFString(PerformanceDataTool.VERSION);
       //目前只有总体信息块,颜色块，memory块，fun块，以后可能有更多的分类
        blockstr.push("DataInfo01","Color","NodeInfo");
        dataByte.writeUint16(blockstr.length);
        for(let i = 0;i<blockstr.length;i++){
            dataByte.writeUTFString(blockstr[i]);
        }
        blockStart.length = blockstr.length;
        blocklength.length = blockstr.length;
        blockStartPos = dataByte.pos;
        //占位
        for(let i = 0;i<blockstr.length;i++){
            dataByte.writeInt32(0);
            dataByte.writeInt32(0);
        }
        //DataInfo01
        blockStart[0] = dataByte.pos;
        //DataInfo01-NodeNums
        dataByte.writeInt32(this._nodeList.length);//节点数量
        dataByte.writeInt32(this.samplerFramStep);//节点步进
        dataByte.writeInt32(this._pathCount);//节点数据长度
        //DataInfo01-allPath
        for(let j in this._AllPathMap){
            dataByte.writeUTFString(j);
        }
        //DataInfo01-memoryPath
        tempStartPos = dataByte.pos;
        dataByte.writeInt32(0);
        
        for(let k in this._memoryDataMap){
            dataByte.writeUTFString(k)
            tempNum++
        }
        tempEndPos = dataByte.pos;
        dataByte.pos = tempStartPos;
        dataByte.writeInt32(tempNum);
        dataByte.pos = tempEndPos;
        blocklength[0] = dataByte.pos - blockStart[0];
        //Color
        blockStart[1] = dataByte.pos;
        tempStartPos = dataByte.pos;
        tempNum = 0;
        dataByte.writeInt32(0);
        for(let l in this._pathColor){
            var vec4 = this._pathColor[l];
            dataByte.writeUTFString(l);
            dataByte.writeUint32(vec4[0]);
            dataByte.writeUint32(vec4[1 ]);
            dataByte.writeUint32(vec4[2]);
            dataByte.writeUint32(vec4[3]);
            tempNum++;
        }
        tempEndPos = dataByte.pos;
        dataByte.pos = tempStartPos;
        dataByte.writeInt32(tempNum);
        dataByte.pos = tempEndPos;
        blocklength[1] = dataByte.pos - blockStart[1];
        //Node Block 记录每一个Node的数据
        blockStart[2] = dataByte.pos;
        for(let n = 0;n<this._nodeList.length;n++){
            let node = this._nodeList[n];
            dataByte.writeInt32(node.nodeNum);
            // node.nodeDelty.forEach(element => {
            //     dataByte.writeFloat32(element);
            // });
            for(var ii = 0;ii<node.nodeNum;ii++){
                dataByte.writeFloat32(node.nodeDelty[ii]?node.nodeDelty[ii]:0);
            }
        }
        blocklength[2] = dataByte.pos-blockStart[2];

        //反推
        dataByte.pos = blockStartPos;
        for(let v=0;v<blockstr.length;v++){
            dataByte.writeInt32(blockStart[v]);
            dataByte.writeInt32(blocklength[v]);
        }
        return dataByte;
    }

    /**
     * 开始分析一段带有标签的代码。
     * @param samplerPath 
     * @param groupPath 
     */
    BegainSample(samplePath:string){
        if(!this.enable) return;
        this.update();
        this._runtimeNode.getFunStart(this.getNodePathIndex(samplePath));
    }


    /**
     * 结束分析一段带有标签的代码
     * @param samplerPath 
     * @param groupPath 
     */
    EndSample(samplePath:string):number{
        if(!this.enable) return 0;
        return this._runtimeNode.getFunEnd(this.getNodePathIndex(samplePath));
    }


    /**
     * 记录某个数据的增加
     * @param memoryGroup 
     * @param memoryPath 
     * @param size 
     */
    AddMemory(memoryPath:string,size:number){
        this._memoryDataMap[memoryPath] = this._memoryDataMap[memoryPath]?(this._memoryDataMap[memoryPath]+size):size;
    }

    /**
     * 设置数据颜色
     * @param path 
     * @param color 
     */
    setPathDataColor(path:string,color:Array<number>){
        this._pathColor[path] = color;
    }

    /**
     * 重置数据
     */
    resetReCordData(){
            //回收节点
        this._nodeList.forEach(element => {
            PerforManceNode.revert(element);
        });
        this._nodeList = [];
        this._runtimeNode = null;
        this._AllPathMap = {};
        this._memoryDataMap = {};
        this._pathColor = {};
        this._pathCount = 0;
    }

    /**
     * 实时绘制前一帧的数据在面板上面
     * @param perforNode 
     */
    exportFrontNode(ob:PerforManceNode,pathIndex:number){
        if (!ob || !ob.nodeDelty||pathIndex==-1) {
            return;
        }
        const width = PerformanceDataTool.DrawWidth;
        const height = PerformanceDataTool.DrawHeight;
        const stepLength = PerformanceDataTool.StepLength;
        const fullStepTime = 33;

        const bgColor = "rgba(150, 150, 150, 0.8)"; // "rgba(150, 150, 150, 0.8)"
        let array, value, percent;
        this._sp.graphics.clear();
        this._sp.graphics.drawRect(0, 0, width, height, bgColor);
        for (let i = 0, len = ob.nodeDelty.length; i < len; i++) {
        
           if(i != pathIndex&&i!=this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)){
               continue;
           }
            // 当前值
            value = ob.nodeDelty[i];
            percent = value / fullStepTime;
            if (!this.pointArray[i]) {
                this.pointArray[i] = [];
            }
            array = this.pointArray[i];
            if (array.length >= stepLength) {
                array.shift();
            }
            array.push(percent);
            // draw
            let color = i.toString(16);
            let fillColor = `#${color}${color}C4${color}${color}`; // ob.xxx.color[i] // #EFC457
            if(i==this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)){
                fillColor = "#FFFFFF";
            }
            if(!PerformanceDataTool.stepLengthArrayMap[i]){
                PerformanceDataTool.stepLengthArrayMap[i] = new Array<number>(PerformanceDataTool.StepLength*2);
            }
            this.updatelineChart(width, height, stepLength, array, fillColor, 1,PerformanceDataTool.stepLengthArrayMap[i]);
        }
        this._sp.graphics.drawLine(0, height / 2, width, height / 2, "green", 1);
        this._sp.graphics.drawLine(0, height / 4 * 3, width, height / 4 * 3, "red", 1);
    }

    updatelineChart(width: number, height: number, stepLength: number, array: Array<number>, fillColor: string, style: number,drawArray:Array<number>) {
        // 样式一
        switch (style) {
            case 1:
                //let copy = array.concat();
                let copy = drawArray;
                for (let i = 0, len = array.length; i < len; i++) {
                    copy[i*2] = width / stepLength * i; // 加入x坐标
                    copy[i * 2 + 1] = Math.max(height - array[i] * height/this.samplerFramStep, 0); // 修改y坐标值，相对于 16ms，反转坐标
                }
                this._sp.graphics.drawLines(0, 0, copy, fillColor, 1);
                break;
            case 2:
                // 样式二
                let widthStep = width / stepLength;
                for (let i = 0, len = array.length; i < len; i++) {
                    this._sp.graphics.drawRect(width / stepLength * i, height, widthStep, -Math.min(array[i] /* / 16*/ * height, height), fillColor);
                }
        }
    }

    /**
     * 更新
     */
    update(){
        let currentFrame = Stat.loopCount;
        let nodelenth:number = ((currentFrame - this._startFram)/this.samplerFramStep)|0;
        //如果要更新记录节点
        if(!nodelenth){
            this._runtimeNode = PerforManceNode.create(this._pathCount)
            this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)] = performance.now();
            return;
        }
        if(nodelenth != this._nodeList.length){
            for(let i in this._memoryDataMap){
                this._runtimeNode.setMemory(this.getNodePathIndex(i), this._memoryDataMap[i]);
            }
            if(this._runtimeNode){
                this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_DELTYTIME)]=performance.now() - this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)];
                this.exportFrontNode(this._runtimeNode,this._runtimeShowPathIndex);
                //发送准备好的节点TODO:
                ProfileHelper.sendFramData( this._runtimeNode);
            }
            this._runtimeNode = PerforManceNode.create(this._pathCount);
            this._runtimeNode.nodeDelty[this.getNodePathIndex(PerformanceDataTool.PERFORMANCE_STARTTIME)] = performance.now();
            this._nodeList.push(this._runtimeNode);
        }
    }

    // /**
    //  * TODO:快捷显示一个Memory组的值
    //  * @param memoryGroup 
    //  */
    // static showMemoryGroupData(memoryGroup:string){

    // }

    /**
     * TODO:快捷显示一个MemeryData的值
     * @param memoryGroup 
     * @param memoryPath 
     */
    static showMemoryData(memoryPath:string){

    }

    // /**
    //  * TODO：快捷显示一个路径组的时间线
    //  * @param groupPath 
    //  */
    static showFunSampleGroup(groupPath:string){
        
    }

    /**
     * TODO:快捷显示一个方法时间的时间线
     * @param groupPath 
     * @param samplePath 
     */
    showFunSampleFun(samplePath:string){
        this.runtimeShowPath = samplePath;
    }

}

export class PerforManceNode{
    
    /**对象池 */
    static _pool:Array<PerforManceNode> = [];

    /**
     * 获得一个性能节点
     * @returns 
     */
    static create(nodeNum:number):PerforManceNode{
        let perNode:PerforManceNode;
        perNode = this._pool.length>0?this._pool.pop():new PerforManceNode();
        perNode.resetData(nodeNum);
        perNode.inPool = false;
        return perNode;
    }
    /**
     * 回收一个性能节点
     * @param node 
     */
    static revert(node:PerforManceNode){
        node.inPool = true;
        this._pool.push(node);
        node.clearData();
    }


    inPool:boolean = false;
    nodeNum:number = 0;
    nodeStart:Array<number> = [];
    nodeDelty:Array<number> = [];
    applyCount:number = 0;


    /**
     * 性能节点
     * @param index 
     */
    constructor(){

    }

    /**
     * 清理数据
     */
    clearData(){
        this.nodeStart.length = 0;
        this.nodeDelty.length = 0;
    }

    /**
     * 重置数据
     * @param nodeNum 数据长度
     */
    resetData(nodeNum:number){
        this.nodeNum = nodeNum;
        this.nodeStart.length = nodeNum;
        this.nodeDelty.length = nodeNum;
    }

    /**
     * 记录时间开始
     * @param index 
     */
    getFunStart(index:number){
        this.applyCount++;
        this.nodeStart[index] = performance.now();
    }

    /**
     * 记录时间结束时间
     * @param index 
     */
    getFunEnd(index:number):number{
        if(this.nodeDelty[index])
        this.nodeDelty[index] +=(this.nodeStart[index]!=0)?(performance.now()-this.nodeStart[index]):0; 
        else{
            this.nodeDelty[index] =(this.nodeStart[index]!=0)?(performance.now()-this.nodeStart[index]):0
            this.nodeNum = this.nodeDelty.length;
        }
        return this.nodeDelty[index];
    }

    /**
     * 记录资源数据
     * @param index 
     * @param value 
     */
    setMemory(index:number,value:number){
        this.nodeDelty[index] = value;
    }

    getPathData(index:number):number{
        return this.nodeDelty[index];
    }
}