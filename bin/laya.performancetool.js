(function (exports, Laya) {
    'use strict';

    class PerformanceDataTool {
        constructor() {
            this._enable = false;
            this._AllPathMap = {};
            this._pathColor = {};
            this._pathCount = 0;
            this._nodeList = [];
            this.samplerFramStep = 1;
            this._memoryDataMap = {};
        }
        static InitLayaPerformanceInfo() {
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_2D, [255, 128, 128, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D, [255, 255, 128, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER, [128, 255, 128, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_UPDATESCRIPT, [128, 255, 255, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS, [0, 128, 255, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE, [255, 0, 0, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION, [255, 128, 0, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS, [128, 0, 0, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER, [64, 128, 128, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP, [192, 192, 192, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CLUSTER, [128, 64, 64, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CULLING, [0, 64, 128, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE, [128, 0, 64, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE, [128, 0, 255, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER, [128, 128, 64, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT, [128, 0, 255, 255]);
            PerformanceDataTool.instance.setPathDataColor(PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS, [0, 255, 0, 255]);
        }
        set enable(value) {
            if (value) {
                this._startFram = Laya.Stat.loopCount;
                this.resetReCordData();
            }
            this._enable = value;
        }
        get enable() {
            return this._enable;
        }
        getNodePathIndex(path) {
            var id;
            if (this._AllPathMap[path] != null)
                id = this._AllPathMap[path];
            else {
                id = this._pathCount++;
                this._AllPathMap[path] = id;
            }
            return id;
        }
        exportPerformanceFile() {
            PerformanceDataTool.InitLayaPerformanceInfo();
            this.enable = false;
            debugger;
            let blockstr = [];
            let blockStart = [];
            let blocklength = [];
            let tempNum = 0;
            let blockStartPos;
            let tempStartPos;
            let tempEndPos;
            let dataByte = new Laya.Byte();
            dataByte.pos = 0;
            dataByte.writeUTFString(PerformanceDataTool.VERSION);
            blockstr.push("DataInfo01", "Color", "NodeInfo");
            dataByte.writeUint16(blockstr.length);
            for (let i = 0; i < blockstr.length; i++) {
                dataByte.writeUTFString(blockstr[i]);
            }
            blockStart.length = blockstr.length;
            blocklength.length = blockstr.length;
            blockStartPos = dataByte.pos;
            for (let i = 0; i < blockstr.length; i++) {
                dataByte.writeInt32(0);
                dataByte.writeInt32(0);
            }
            blockStart[0] = dataByte.pos;
            dataByte.writeInt32(this._nodeList.length);
            dataByte.writeInt32(this.samplerFramStep);
            dataByte.writeInt32(this._pathCount);
            for (let j in this._AllPathMap) {
                dataByte.writeUTFString(j);
            }
            tempStartPos = dataByte.pos;
            dataByte.writeInt32(0);
            for (let k in this._memoryDataMap) {
                dataByte.writeUTFString(k);
                tempNum++;
            }
            tempEndPos = dataByte.pos;
            dataByte.pos = tempStartPos;
            dataByte.writeInt32(tempNum);
            dataByte.pos = tempEndPos;
            blocklength[0] = dataByte.pos - blockStart[0];
            blockStart[1] = dataByte.pos;
            tempStartPos = dataByte.pos;
            tempNum = 0;
            dataByte.writeInt32(0);
            for (let l in this._pathColor) {
                var vec4 = this._pathColor[l];
                dataByte.writeUTFString(l);
                dataByte.writeUint32(vec4[0]);
                dataByte.writeUint32(vec4[1]);
                dataByte.writeUint32(vec4[2]);
                dataByte.writeUint32(vec4[3]);
                tempNum++;
            }
            tempEndPos = dataByte.pos;
            dataByte.pos = tempStartPos;
            dataByte.writeInt32(tempNum);
            dataByte.pos = tempEndPos;
            blocklength[1] = dataByte.pos - blockStart[1];
            blockStart[2] = dataByte.pos;
            for (let n = 0; n < this._nodeList.length; n++) {
                let node = this._nodeList[n];
                dataByte.writeInt32(node.nodeNum);
                for (var ii = 0; ii < node.nodeNum; ii++) {
                    dataByte.writeFloat32(node.nodeDelty[ii] ? node.nodeDelty[ii] : 0);
                }
            }
            blocklength[2] = dataByte.pos - blockStart[2];
            dataByte.pos = blockStartPos;
            for (let v = 0; v < blockstr.length; v++) {
                dataByte.writeInt32(blockStart[v]);
                dataByte.writeInt32(blocklength[v]);
            }
            return dataByte;
        }
        BegainSample(samplePath) {
            if (!this.enable)
                return;
            this.update();
            this._runtimeNode.getFunStart(this.getNodePathIndex(samplePath));
        }
        EndSample(samplePath) {
            if (!this.enable)
                return 0;
            return this._runtimeNode.getFunEnd(this.getNodePathIndex(samplePath));
        }
        AddMemory(memoryPath, size) {
            this._memoryDataMap[memoryPath] = this._memoryDataMap[memoryPath] ? (this._memoryDataMap[memoryPath] + size) : size;
        }
        setPathDataColor(path, color) {
            this._pathColor[path] = color;
        }
        resetReCordData() {
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
        exportFrontNode(perforNode) {
            this.exportFrontNodeFn.call(this, perforNode);
        }
        update() {
            let currentFrame = Laya.Stat.loopCount;
            let nodelenth = ((currentFrame - this._startFram) / this.samplerFramStep) | 0;
            if (!nodelenth) {
                this._runtimeNode = PerforManceNode.create(this._pathCount);
                return;
            }
            if (nodelenth != this._nodeList.length) {
                for (let i in this._memoryDataMap) {
                    this._runtimeNode.setMemory(this.getNodePathIndex(i), this._memoryDataMap[i]);
                }
                this.exportFrontNode(this._runtimeNode);
                this._runtimeNode = PerforManceNode.create(this._pathCount);
                this._nodeList.push(this._runtimeNode);
            }
        }
        static showMemoryGroupData(memoryGroup) {
        }
        static showMemoryData(memoryPath) {
        }
        static showFunSampleGroup(groupPath) {
        }
        static showFunSampleFun(samplePath) {
        }
    }
    PerformanceDataTool.VERSION = "PERFORMANCEDATA:01";
    PerformanceDataTool.instance = new PerformanceDataTool();
    PerformanceDataTool.PERFORMANCE_LAYA = "Laya";
    PerformanceDataTool.PERFORMANCE_LAYA_3D = "Laya/3D";
    PerformanceDataTool.PERFORMANCE_LAYA_2D = "Laya/2D";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_PRERENDER = "Laya/3D/PreRender";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_UPDATESCRIPT = "Laya/3D/UpdateScript";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS = "Laya/3D/Physics";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE = "Laya/3D/Physics/simulate";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION = "Laya/3D/Physics/updataCharacters&Collisions";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS = "Laya/3D/Physics/eventScripts";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER = "Laya/3D/Render";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP = "Laya/3D/Render/ShadowMap";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CLUSTER = "Laya/3D/Render/Cluster";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_CULLING = "Laya/3D/Render/Culling";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE = "Laya/3D/Render/RenderDepthMode";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE = "Laya/3D/Render/RenderOpaque";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER = "Laya/3D/Render/RenderCommandBuffer";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT = "Laya/3D/Render/RenderTransparent";
    PerformanceDataTool.PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS = "Laya/3D/Render/PostProcess";
    PerformanceDataTool.text = new Laya.Stat();
    PerformanceDataTool.text2 = new Laya.Byte();
    PerformanceDataTool._surpport = false;
    class PerforManceNode {
        constructor() {
            this.inPool = false;
            this.nodeNum = 0;
            this.nodeStart = [];
            this.nodeDelty = [];
            this.applyCount = 0;
        }
        static create(nodeNum) {
            let perNode;
            perNode = this._pool.length > 0 ? this._pool.pop() : new PerforManceNode();
            perNode.resetData(nodeNum);
            perNode.inPool = false;
            return perNode;
        }
        static revert(node) {
            node.inPool = true;
            this._pool.push(node);
            node.clearData();
        }
        clearData() {
            this.nodeStart.length = 0;
            this.nodeDelty.length = 0;
        }
        resetData(nodeNum) {
            this.nodeNum = nodeNum;
            this.nodeStart.length = nodeNum;
            this.nodeDelty.length = nodeNum;
        }
        getFunStart(index) {
            this.applyCount++;
            this.nodeStart[index] = performance.now();
        }
        getFunEnd(index) {
            if (this.nodeDelty[index])
                this.nodeDelty[index] += (this.nodeStart[index] != 0) ? (performance.now() - this.nodeStart[index]) : 0;
            else {
                this.nodeDelty[index] = (this.nodeStart[index] != 0) ? (performance.now() - this.nodeStart[index]) : 0;
                this.nodeNum = this.nodeDelty.length;
            }
            return this.nodeDelty[index];
        }
        setMemory(index, value) {
            this.nodeDelty[index] = value;
        }
        getPathData(index) {
            return this.nodeDelty[index];
        }
    }
    PerforManceNode._pool = [];

    class PerformanceNodeParse {
        static parsePerformanceFile(performance, outData) {
            performance.pos = 0;
            PerformanceNodeParse.performanceData = outData;
            PerformanceNodeParse._readData = performance;
            PerformanceNodeParse.READ_DATA();
            for (let i = 0, n = PerformanceNodeParse._blockStr.length; i < n; i++) {
                var blockName = PerformanceNodeParse._blockStr[i];
                var fn = PerformanceNodeParse["READ_" + blockName];
                if (fn == null)
                    throw new Error("model file err,no this function:" + blockName);
                else {
                    PerformanceNodeParse._readData.pos = PerformanceNodeParse._blockStart[i];
                    fn.call(null);
                }
            }
        }
        static READ_DATA() {
            let data = PerformanceNodeParse._readData;
            let version = data.readUTFString();
            if (version != "PERFORMANCEDATA:01") {
                throw version + "is not standard Version";
            }
            let blocklenth = PerformanceNodeParse._blockStr.length = data.readUint16();
            for (let i = 0; i < blocklenth; i++) {
                PerformanceNodeParse._blockStr[i] = data.readUTFString();
            }
            for (let j = 0; j < blocklenth; j++) {
                PerformanceNodeParse._blockStart[j] = data.readInt32();
                PerformanceNodeParse._blocklength[j] = data.readInt32();
            }
        }
        static READ_DataInfo01() {
            let data = PerformanceNodeParse._readData;
            let performanceData = PerformanceNodeParse.performanceData;
            PerformanceNodeParse._nodeNums = data.readInt32();
            performanceData.samplerFramStep = data.readInt32();
            let pathCount = data.readInt32();
            for (let i = 0; i < pathCount; i++) {
                performanceData.getNodePathIndex(data.readUTFString());
            }
            let memoryPath = data.readInt32();
            for (let j = 0; j < memoryPath; j++) {
                performanceData._memoryDataMap[data.readUTFString()] = 1;
            }
        }
        static READ_Color() {
            let data = PerformanceNodeParse._readData;
            let performanceData = PerformanceNodeParse.performanceData;
            let colorlength = data.readInt32();
            for (let i = 0; i < colorlength; i++)
                performanceData.setPathDataColor(data.readUTFString(), [data.readUint32(), data.readUint32(), data.readUint32(), data.readUint32()]);
        }
        static READ_NodeInfo() {
            let data = PerformanceNodeParse._readData;
            let performanceData = PerformanceNodeParse.performanceData;
            let perNode;
            let length;
            for (let i = 0; i < PerformanceNodeParse._nodeNums; i++) {
                length = data.readInt32();
                perNode = PerforManceNode.create(length);
                for (let l = 0, n = length; l < n; l++)
                    perNode.nodeDelty[l] = data.readFloat32();
                performanceData._nodeList[i] = perNode;
            }
        }
    }
    PerformanceNodeParse._blockStr = [];
    PerformanceNodeParse._blockStart = [];
    PerformanceNodeParse._blocklength = [];
    PerformanceNodeParse.performanceData = new PerformanceDataTool();

    exports.PerforManceNode = PerforManceNode;
    exports.PerformanceDataTool = PerformanceDataTool;
    exports.PerformanceNodeParse = PerformanceNodeParse;

}(window.Laya = window.Laya || {}, Laya));
