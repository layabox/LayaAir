import { ObjectTools } from "./ObjectTools";
import { IDTools } from "./IDTools";
import { Laya } from "Laya";
import { ClassTool } from "./ClassTool";
import { DebugTool } from "../DebugTool"
import { Sprite } from "laya/display/Sprite";
import { Matrix } from "laya/maths/Matrix";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { HitArea } from "laya/utils/HitArea";
import { InputManager } from "laya/events/InputManager";
import { IHitArea } from "laya/utils/IHitArea";

/**
 * ...
 * @author ww
 */
export class MouseEventAnalyser {

    constructor() {

    }

    static infoO: any = {};
    static nodeO: any = {};
    static hitO: any = {};

    static analyseNode(node: Sprite): void {
        DebugTool.showDisBound(node, true);
        var _node: Sprite;
        _node = node;
        ObjectTools.clearObj(MouseEventAnalyser.infoO);
        ObjectTools.clearObj(MouseEventAnalyser.nodeO);
        ObjectTools.clearObj(MouseEventAnalyser.hitO);
        var nodeList: any[];
        nodeList = [];
        while (node) {
            IDTools.idObj(node);
            MouseEventAnalyser.nodeO[IDTools.getObjID(node)] = node;
            nodeList.push(node);
            node = (<Sprite>node.parent);
        }
        MouseEventAnalyser.check(Laya.stage, Laya.stage.mouseX, Laya.stage.mouseY, null);
        var canStr: string;
        if (MouseEventAnalyser.hitO[IDTools.getObjID(_node)]) {
            console.log("can hit");
            canStr = "can hit";
        }
        else {
            console.log("can't hit");
            canStr = "can't hit";
        }
        var i: number, len: number;
        nodeList = nodeList.reverse();
        len = nodeList.length;
        var rstTxts: any[];
        rstTxts = ["[分析对象]:" + ClassTool.getNodeClassAndName(_node) + ":" + canStr];
        for (i = 0; i < len; i++) {
            node = nodeList[i];
            if (MouseEventAnalyser.hitO[IDTools.getObjID(node)]) {
                console.log("can hit:", ClassTool.getNodeClassAndName(node));
                console.log("原因:", MouseEventAnalyser.infoO[IDTools.getObjID(node)]);
                rstTxts.push("can hit:" + " " + ClassTool.getNodeClassAndName(node));
                rstTxts.push("原因:" + " " + MouseEventAnalyser.infoO[IDTools.getObjID(node)]);
            }
            else {
                console.log("can't hit:" + ClassTool.getNodeClassAndName(node));
                console.log("原因:", MouseEventAnalyser.infoO[IDTools.getObjID(node)] ? MouseEventAnalyser.infoO[IDTools.getObjID(node)] : "鼠标事件在父级已停止派发");
                rstTxts.push("can't hit:" + " " + ClassTool.getNodeClassAndName(node));
                rstTxts.push("原因:" + " " + (MouseEventAnalyser.infoO[IDTools.getObjID(node)] ? MouseEventAnalyser.infoO[IDTools.getObjID(node)] : "鼠标事件在父级已停止派发"));
            }
        }
        var rstStr: string;
        rstStr = rstTxts.join("\n");


    }
    private static _matrix: Matrix = new Matrix();
    private static _point: Point = new Point();
    private static _rect: Rectangle = new Rectangle();

    static check(sp: Sprite, mouseX: number, mouseY: number, callBack: Function): boolean {
        IDTools.idObj(sp);
        var isInAnlyseChain: boolean;
        isInAnlyseChain = MouseEventAnalyser.nodeO[IDTools.getObjID(sp)];
        MouseEventAnalyser._point.setTo(mouseX, mouseY);
        sp.fromParentPoint(MouseEventAnalyser._point);
        mouseX = MouseEventAnalyser._point.x;
        mouseY = MouseEventAnalyser._point.y;

        //如果有裁剪，则先判断是否在裁剪范围内
        var scrollRect: Rectangle = sp.scrollRect;
        if (scrollRect) {
            MouseEventAnalyser._rect.setTo(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
            var isHit: boolean = MouseEventAnalyser._rect.contains(mouseX, mouseY);
            if (!isHit) {
                if (isInAnlyseChain) {
                    MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "scrollRect没有包含鼠标" + MouseEventAnalyser._rect.toString() + ":" + mouseX + "," + mouseY;
                }
                return false;
            }
        }


        //先判定子对象是否命中

        var i: number, len: number;
        var cList: any[];
        cList = (sp as any)._children;
        len = cList.length;
        var child: Sprite;
        var childInChain: Sprite;
        childInChain = null;
        for (i = 0; i < len; i++) {
            child = cList[i];
            IDTools.idObj(child);
            if (MouseEventAnalyser.nodeO[IDTools.getObjID(child)]) {
                childInChain = child;
                break;
            }
        }
        var coverByOthers: boolean;
        coverByOthers = childInChain ? true : false;
        var flag: boolean = false;
        //优先判断父对象
        if (sp.hitTestPrior && !sp.mouseThrough && !MouseEventAnalyser.hitTest(sp, mouseX, mouseY)) {
            MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "hitTestPrior=true，宽高区域不包含鼠标:" + ":" + mouseX + "," + mouseY + " size:" + sp.width + "," + sp.height;
            return false;
        }
        for (i = (sp as any)._children.length - 1; i > -1; i--) {
            child = (sp as any)._children[i];
            if (child == childInChain) {
                if (!childInChain.mouseEnabled) {
                    MouseEventAnalyser.infoO[IDTools.getObjID(childInChain)] = "mouseEnabled=false";
                }
                if (!childInChain.visible) {
                    MouseEventAnalyser.infoO[IDTools.getObjID(childInChain)] = "visible=false";
                }
                coverByOthers = false;
            }
            //只有接受交互事件的，才进行处理
            if (child.mouseEnabled && child.visible) {
                flag = MouseEventAnalyser.check(child, mouseX, mouseY, callBack);

                if (flag) {
                    MouseEventAnalyser.hitO[IDTools.getObjID(sp)] = true;
                    MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "子对象被击中";
                    if (child == childInChain) {
                        MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "子对象被击中," + "击中对象在分析链中";
                    }
                    else {
                        MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "子对象被击中," + "击中对象不在分析链中";
                        if (coverByOthers) {

                            MouseEventAnalyser.infoO[IDTools.getObjID(childInChain)] = "被兄弟节点挡住,兄弟节点信息:" + ClassTool.getNodeClassAndName(child) + "," + child.getBounds().toString();
                            DebugTool.showDisBound(child, false, "#ffff00");
                        }
                    }

                    return true;
                }
                else {
                    if (child == childInChain) {
                        coverByOthers = false;
                    }
                }
            }
        }

        var mHitRect: Rectangle = new Rectangle();
        //判断是否在矩形区域内
        var graphicHit: boolean = false;
        graphicHit = sp.getGraphicBounds().contains(mouseX, mouseY);
        if (sp.width > 0 && sp.height > 0) {

            var hitRect: IHitArea = MouseEventAnalyser._rect;
            if (!sp.mouseThrough) {
                if (sp.hitArea)
                    hitRect = sp.hitArea;
                else
                    (<Rectangle>hitRect).setTo(0, 0, sp.width, sp.height);
                if (hitRect instanceof Rectangle)
                    mHitRect.copyFrom(hitRect);
                isHit = hitRect.contains(mouseX, mouseY);
            }
            else {
                //如果可穿透，则根据子对象实际大小进行碰撞
                isHit = graphicHit;
                mHitRect.copyFrom(sp.getGraphicBounds());
            }

            if (isHit) {
                //					_target = sp;
                MouseEventAnalyser.hitO[IDTools.getObjID(sp)] = true;
            }
        } else {

        }
        if (!isHit) {
            if (graphicHit) {
                MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "子对象未包含鼠标，实际绘图区域包含鼠标，设置的宽高区域不包含鼠标:" + ":" + mouseX + "," + mouseY + " hitRec:" + mHitRect.toString() + " graphicBounds:" + sp.getGraphicBounds().toString() + "，设置mouseThrough=true或将宽高设置到实际绘图区域可解决问题";
            } else {
                MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "子对象未包含鼠标，实际绘图区域不包含鼠标，设置的宽高区域不包含鼠标:" + ":" + mouseX + "," + mouseY + " hitRec:" + mHitRect.toString() + " graphicBounds:" + sp.getGraphicBounds().toString();
            }

        }
        else {
            MouseEventAnalyser.infoO[IDTools.getObjID(sp)] = "自身区域被击中";
        }
        return isHit;
    }
    private static hitTest(sp: Sprite, mouseX: number, mouseY: number): boolean {
        var isHit: boolean = false;
        if (sp.hitArea instanceof HitArea) {
            return InputManager.inst.hitTest(sp, mouseX, mouseY);
        }
        if (sp.width > 0 && sp.height > 0 || sp.mouseThrough || sp.hitArea) {
            //判断是否在矩形区域内
            var hitRect: IHitArea = MouseEventAnalyser._rect;
            if (!sp.mouseThrough) {
                if (sp.hitArea) hitRect = sp.hitArea;
                else (<Rectangle>hitRect).setTo(0, 0, sp.width, sp.height);
                isHit = hitRect.contains(mouseX, mouseY);
            } else {
                //如果可穿透，则根据子对象实际大小进行碰撞
                isHit = sp.getGraphicBounds().contains(mouseX, mouseY);
            }
        }
        return isHit;
    }
}

DebugTool.analyseMouseHit = () => {
    if (DebugTool.target)
        MouseEventAnalyser.analyseNode(DebugTool.target);
}
