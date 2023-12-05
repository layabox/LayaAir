import { EBlueNodeType, EPinDirection, EPinType } from "../core/EBluePrint";
import { TBPNodeData, TBPNodeDef } from "../core/type/TBluePrint";
import { BPPinRuntime } from "./BPPinRuntime";
import { BPRuntime } from "./BPRuntime";
import { BPStaticFun } from "./BPStaticFun";
import { BPFactory } from "./BPFactory";
import { BPExcuteNode } from "./action/BPExcuteNode";
import { BPGenCodeNode } from "./action/BPGenCodeNode";
import { BPExcuteDebuggerNode } from "./action/BPExcuteDebuggerNode";
import { BPType, TBPNode } from "../datas/types/BlueprintTypes";
//import { TBPNode } from "../interface/BlueprintTypes";

// function createPrint() {
//     let print = new BPRuntimeNode();
//     print.name = "Print";
//     print.type = EBlueNodeType.Fun;

//     print.nativeFun = BPStaticFun.print;

//     let excute = new BPPinRuntime();
//     excute.direction = EPinDirection.Input;
//     excute.type = EPinType.Exec;

//     print.addPin(excute);

//     let str = new BPPinRuntime();
//     str.direction = EPinDirection.Input;
//     str.type = EPinType.Other;

//     print.addPin(str);


//     let excuteTo = new BPPinRuntime();
//     excuteTo.direction = EPinDirection.Output;
//     excuteTo.type = EPinType.Exec;
//     print.addPin(excuteTo);

//     return print;
// }

// let newjson:Array<TBPNode>=[
//     {
//         id:0,
//         cid:"0",
//         output:{
//             "then":{
//               infoArr:[{
//                     nodeId:1,
//                     name:"execute",
//                     index:0
//               }]
//             }
//         }
//     },
//     {
//         id:1,
//         cid:"2",
//         input:{
//             "str":{
//                 value:"hello",
//             }
//         }
//     }
// ]


// let bpjson: TBPNodeDef[] = [
//     {
//         name:"onAwake",
//         id: "0",
//         type:BPType.Event,
//         // did: "0",
//         outPut:[
//             {
//                 name:"then",
//                 type:"exec"
//             }
//         ]
//         // data: {
//         //     "then": {
//         //         linkto: ["1:execute:0"]
//         //     }
//         // }
//     },
//     {
//         name:"printString",
//         id: "1",
//         type:BPType.Function,
//         // did: "2",
//         inPut:[
//             {
//                 name: "str",
//                 type: "string"
//             }
//         ],
//         outPut:[
//             {
//                 name:"then",
//                 type:"exec"
//             }
//         ]
//         // data: {
//         //     "then": {
//         //         linkto: ["2:execute:0"]
//         //     },
//         //     "str": {
//         //         value: "hello",
//         //     }
//         // }
//     },
//     {
//         name:"printString",
//         type:BPType.Function,
//         id: "2",
//         inPut:[
//             {
//                 name: "str",
//                 type: "string"
//             }
//         ],
//         outPut:[
//             {
//                 name:"then",
//                 type:"exec"
//             }
//         ]
//         // did: "2",
//         // data: {
//         //     "str": {
//         //         value: "world",
//         //     },
//         //     "then": {
//         //         linkto: ["6:execute:0"]
//         //     }
//         // }
//     },
//     {
//         name: "getabVar",
//         id: "3",
//         // did: "3",
//         type:BPType.GetValue,
//         outPut: [
//             {
//                 name: "ab",
//                 type: "string"
//             }
//         ]
//         // data: {
//         //     "ab": {
//         //         linkto: ["5:a:0"],
//         //     }
//         // }
//     },
//     {
//         name: "getcdVar",
//         id: "4",
//         type: BPType.GetValue,
//         outPut: [
//             {
//                 name: "cd",
//                 type: "string"
//             }
//         ]
//         // data: {
//         //     "cd": {
//         //         linkto: ["5:b:1","9:a:0"],
//         //     }
//         // }
//     },
//     {
//         name: "add",
//         id: "5",
//         type: BPType.Pure,
//         // did: "5",
//         inPut: [
//             {
//                 name: "a",
//                 type: "int"
//             },
//             {
//                 name: "b",
//                 type: "int"
//             }
//         ],
//         outPut: [
//             {
//                 name: "return",
//                 type: "int"
//             }
//         ]
//         // data: {
//         //     "a": {
//         //         value: 12
//         //     },
//         //     "b": {
//         //         value: 34
//         //     },
//         //     "return": {
//         //         linkto: ["2:str:1"],
//         //     }
//         // }
//     },
//     {
//         name: "branch",
//         id: "6",
//         type: BPType.Branch,
//         inPut: [
//             {
//                 name: "execute",
//                 type: "exec"
//             },
//             {
//                 name: "condition",
//                 type: "int"
//             }
//         ],
//         outPut: [
//             {
//                 name: "true",
//                 type: "exec"
//             },
//             {
//                 name: "false",
//                 type: "exec"
//             }
//         ]
//         // did: "9",
//         // data: {
      
//         //     "then0": {
//         //         linkto: ["7:execute:0"],
//         //     },
//         //     "then1": {
//         //         linkto: ["8:execute:0"],
//         //     }
//         // }
//     },
//     // {
//     //     id: "6",
//     //     did: "6",
//     //     data: {
      
//     //         "true": {
//     //             linkto: ["7:execute:0"],
//     //         },
//     //         "false": {
//     //             linkto: ["8:execute:0"],
//     //         }
//     //     }
//     // },
//     {
//         id: "7",
//         did: "2",
//         data: {
//             "str": {
//                 value: "成功",
//             },
//             "then": {
//                 linkto: ["10:execute:0"]
//             }
//         }
//     },
//     {
//         id: "8",
//         did: "2",
//         data: {
//             "str": {
//                 value: "失败",
//             }
//         }
//     },
//     {
//         id:"9",
//         did:"7",
//         data:{
//             "b":{
//                 value:"d"
//             },
//             // "return":{
//             //     linkto:["6:condition:0"]
//             // }
//         }
//     },{
//         id:"10",
//         did:"8",
//         data:{
//             "cd":{
//                 value:"dd"
//             },
//             "then":{
//                 linkto:["1:execute:0"]
//             }
//         }
//     }
// ]
class BPNodeDesc {
    static regClass() {

    }
}


export class TestBluePrint {

    static BPMap: Map<string, TBPNodeDef> = new Map();
    regBPNode() {
        // definejson.forEach(def => {
        //     TestBluePrint.BPMap.set(def.id, def);
        // });
    }

    testBPNode() {
        BPFactory.__init__();

        // let cls=BPFactory.createCls("TestBP", Laya.Node, bpjson);

        // let a=new cls();
        // a.ab="hello";
        // a.cd="world";

        // let b=new cls();
        // b.ab="d";
        // b.cd="d";

        // Laya.stage.addChild(a);
        // Laya.stage.addChild(b);



        // let t = new BPRuntime();
        // bpjson.forEach(item => {
        //     let d = BPFactory.instance.create(TestBluePrint.BPMap.get(item.did));
        //     d.id = item.id;
        //     t.append(d);
        // });

        // bpjson.forEach(item => {
        //     t.getNodeById(item.id).parseLinkData(item.data, t);
        // });

        // //let context = new BPExcuteNode();
        // //let context = new BPGenCodeNode();

        // let context = new BPExcuteNode();
        // context.vars["ab"] = "hello ";
        // context.vars["cd"] = "world";
        // //t.getNodeById("0").outExcutes[0].excute(context);
        // // let code = t.toCode(context);
        // t.run(context, "onAwake", null);



        // let context1 = new BPExcuteNode();
        // context1.vars["ab"] = "nihao ";
        // context1.vars["cd"] = "shabi";
        // //t.getNodeById("0").outExcutes[0].excute(context);
        // // let code = t.toCode(context);
        // debugger;
        // t.run(context1, "onAwake", null);
        // //console.log(code);
        // //debugger;
    }


    constructor() {
        // let w = 750;
        // let h = 1468;
        // Laya3D.init(w, h, null, Laya.Handler.create(this, () => {

        //     this.regBPNode();

        //     this.testBPNode();

        //     return;

        //     // debugger;



        //     // let t = new BPRuntime();

        //     // let eventBlue = new BPRuntimeNode();
        //     // eventBlue.name = "Event OnAwake";
        //     // eventBlue.type = EBlueNodeType.Event;

        //     // let outPin = new BPPinRuntime();
        //     // outPin.direction = EPinDirection.Output;
        //     // outPin.type = EPinType.Exec;


        //     // eventBlue.addPin(outPin);

        //     // let print = createPrint();



        //     // outPin.startLinkTo(print.inExcutes[0]);
        //     // let context = new BPContext();
        //     // context.vars["ab"] = "hello world";
        //     // context.vars["cd"] = "niubi";

        //     // let getVar = new BPRuntimeNode();
        //     // getVar.type = EBlueNodeType.GetVariable;
        //     // getVar.name = "ab";

        //     // let getOutPin = new BPPinRuntime();
        //     // getOutPin.name = "return";
        //     // getOutPin.type = EPinType.Other;
        //     // getOutPin.direction = EPinDirection.Output;

        //     // getVar.addPin(getOutPin);

        //     // getOutPin.startLinkTo(print.parmPins[0]);



        //     // let print1 = createPrint();
        //     // print.outExcutes[0].startLinkTo(print1.inExcutes[0]);
        //     // //getOutPin.startLinkTo(print1.parmPins[0]);


        //     // let getVarCD = new BPRuntimeNode();
        //     // getVarCD.type = EBlueNodeType.GetVariable;
        //     // getVarCD.name = "cd";

        //     // let getOutCDPin = new BPPinRuntime();
        //     // getOutCDPin.name = "return";
        //     // getOutCDPin.type = EPinType.Other;
        //     // getOutCDPin.direction = EPinDirection.Output;

        //     // getVarCD.addPin(getOutCDPin);

        //     // getOutCDPin.startLinkTo(print1.parmPins[0]);

        //     // t.append(eventBlue);
        //     // t.append(print);
        //     // t.append(getVar);
        //     // t.append(getVarCD);
        //     // t.append(print1);

        //     // //    let node= new Laya.Node();
        //     // //    node.addComponent

        //     // //     let jj=CreateClass.jj("XXJJ",Laya.Node,t);
        //     // //     let xx=new jj();
        //     // //     xx.addComponent(BluePrintRuntime);
        //     // //     let jjxx=new jj();
        //     // //     jjxx.addComponent(BluePrintRuntime);

        //     // //     Laya.stage.addChild(xx);
        //     // //     Laya.stage.addChild(jjxx);
        //     // //let jx=xx.mdata.obj==jjxx.mdata.obj

        //     // outPin.excute(context);
        // }));

    }
}
