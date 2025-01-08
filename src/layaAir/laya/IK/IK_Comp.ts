import { Component } from "../components/Component";
import { Sprite3D } from "../d3/core/Sprite3D";
import { ClassUtils } from "../utils/ClassUtils";
import { IK_Chain } from "./IK_Chain";
import { IK_Target } from "./IK_Pose1";
import { IK_System } from "./IK_System";
import { ClsInst } from "./IK_Utils";

export class IK_Comp extends Component {
    static clsid = '09dce20f-f6bd-4192-a494-5e3654ecd158'
    private _ik_sys:IK_System;

    constructor() {
        super();
        ClsInst.addInst(this);
    }

    protected _onEnable(): void {
    }

    protected _onDestroy() {
    }

    protected _onAdded(): void {
        let ik = this._ik_sys = new IK_System(this.owner.scene);
        ik.setRoot(this.owner as Sprite3D);
        ik.showDbg = true;
    }

    protected _onAwake(): void {
    }

    _parse(data: any, interactMap: any = null): void {
        //override it.
    }

    setTarget(name: string, target: IK_Target) {
        this._ik_sys.setTarget(name, target);
    }

    addChainByBoneName(endName: string, length: number, isEndEffector = true): IK_Chain {
        return this._ik_sys.addChainByBoneName(endName, length, isEndEffector);
    }

    onUpdate() {
        //应用ik结果
        this._ik_sys.onUpdate();
    }

    set showDbg(b:boolean){
        this._ik_sys.showDbg=b;
    }

    get showDbg(){
        return this._ik_sys.showDbg;
    }    

    //添加chain
    //添加末端
}

ClassUtils.regClass("IK_Comp", IK_Comp)