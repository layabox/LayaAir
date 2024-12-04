import { Byte } from "laya/utils/Byte";
import { PerformanceDataTool, PerforManceNode } from "./PerformanceDataTool";

export class PerformanceNodeParse {
    private static _readData: Byte;
    private static _blockStr: string[] = [];
    private static _blockStart: number[] = [];
    private static _blocklength: number[] = [];
    private static _nodeNums: number;

    private static performanceData: PerformanceDataTool = new PerformanceDataTool();


    static parsePerformanceFile(performance: Byte, outData: PerformanceDataTool) {
        performance.pos = 0;
        PerformanceNodeParse.performanceData = outData;
        PerformanceNodeParse._readData = performance;
        PerformanceNodeParse.READ_DATA();
        for (let i = 0, n = PerformanceNodeParse._blockStr.length; i < n; i++) {
            var blockName: string = PerformanceNodeParse._blockStr[i];
            var fn: Function = (PerformanceNodeParse as any)["READ_" + blockName];
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
            throw new Error(version + "is not standard Version");
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
        let perNode: PerforManceNode;
        let length;
        for (let i = 0; i < PerformanceNodeParse._nodeNums; i++) {
            length = data.readInt32()
            perNode = PerforManceNode.create(length);
            for (let l = 0, n = length; l < n; l++)
                perNode.nodeDelty[l] = data.readFloat32();
            performanceData._nodeList[i] = perNode;
        }

    }


}