import { property, regClass, runInEditor } from "../../Decorators";
import { LayaEnv } from "../../LayaEnv";
import { Script } from "../components/Script";
import { PixelLineSprite3D } from "../d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { BoneConstraints } from "./BoneConstraints";
import { IK_Chain } from "./IK_Chain";
import { IK_ChainData } from "./IK_ChainData";
import { IK_Constraint1, IK_ConstraintInstance } from "./IK_Constraint1";
import { IK_Constraint_Euler } from "./IK_Constraint_Euler";
import { IK_Constraint_SwingTwist } from "./IK_Constraint_SwingTwist";
import { IK_ConstraintData } from "./IK_ConstraintData";
import { IK_Lookat } from "./IK_Lookat";
import { IK_Target } from "./IK_Pose1";
import { IK_System, SHOW_DBG } from "./IK_System";
import { ILinerender } from "./LineRender";


@regClass() @runInEditor
export class IK_Comp extends Script {
    private _ik_sys:IK_System;
    //_ske3d = new Skeleton3D();
    private _needRebuild=true;

    private _constraintsMap=new Map<Sprite3D,IK_ConstraintInstance>();
    private _showDbg=false;
    private _visualSp:PixelLineSprite3D=null
    private _visualInPlay=true;
    private _chainDatas:IK_ChainData[]=[];
    @property({type:[IK_ChainData],onChange:"onChainDataChange"})
    set chainDatas(v:IK_ChainData[]){
        this._chainDatas = v;
        this._needRebuild = true;
    }
    get chainDatas(){
        return this._chainDatas;
    }


    private _solverIteration=10;
    @property({type:'int',max:100,min:1})
    set solverIteration(v:number){
        this._solverIteration = v;
        this._ik_sys.setMaxIterations(v);
    }
    get solverIteration(){
        return this._solverIteration;
    }

    private _dirsolverIteration=10;
    @property({type:'int',max:100,min:1})
    set dirSolverIteration(v:number){
        this._dirsolverIteration = v;
        IK_Lookat.dirIt = v;
    }
    get dirSolverIteration(){
        return this._dirsolverIteration;
    }    

    @property({type:Number,min:0,max:1})
    set dampingFactor(v:number){
        this._ik_sys.setDampingFactor(v);
    }
    get dampingFactor(){
        return this._ik_sys.getDampingFactor();
    }

    private _constraintDatas:IK_ConstraintData[]
    //@property({type:[IK_ConstraintData],onChange:'onConstraintDataChange'})
    set constraints(cs:IK_ConstraintData[]){
        this._constraintDatas=cs;
        this._needRebuild=true;
    }
    get constraints(){
        return this._constraintDatas;
    }

    onConstraintDataChange(idx:number){
        let constraintComp = this.owner.getComponent(BoneConstraints);
        this.constraints = constraintComp.constraints;
        //this._needRebuild=true;
    }

    @property({type:Boolean,catalog:'debug'})
    set showGizmos(v:boolean){
        this._showDbg=v;
        if(this._ik_sys){
            this._ik_sys.showDbg=v;
        }
    }
    get showGizmos(){
        return this._showDbg;
    }

    @property({type:Boolean,catalog:'debug'})
    set 显示约束(v:boolean){
        if(v)
            SHOW_DBG.add(SHOW_DBG.CONSTRAINT);
        else
            SHOW_DBG.sub(SHOW_DBG.CONSTRAINT);
    }
    get 显示约束(){
        return SHOW_DBG.has(SHOW_DBG.CONSTRAINT);
    }
    @property({type:Boolean,catalog:'debug'})
    set 显约束轴(v:boolean){
        if(v)
            SHOW_DBG.add(SHOW_DBG.CONSTRAINT_AXIS);
        else
            SHOW_DBG.sub(SHOW_DBG.CONSTRAINT_AXIS);
    }
    get 显约束轴(){
        return SHOW_DBG.has(SHOW_DBG.CONSTRAINT_AXIS);
    }    

    @property({type:Boolean})
    get enableSolver(){
        return this._ik_sys.enableSolver;
    }
    set enableSolver(b:boolean){
        this._ik_sys.enableSolver=b;
    }

    @property({type:Boolean,catalog:'debug',caption:'使用动画层'})
    set useAnimLayer(b:boolean){
        this._ik_sys.useAnimLayer = b;
    }
    get useAnimLayer(){
        return this._ik_sys.useAnimLayer;
    }

    constructor() {
        super();
    }
    protected _onAdded(): void {
        let ik = this._ik_sys = new IK_System(this.owner as Sprite3D);
        ik.setRoot(this.owner as Sprite3D);
        ik.showDbg=this._showDbg;
    }

    onAfterDeserialize(){
        this._needRebuild = true;
    }

    onChainDataChange(data:IK_ChainData,key:string,value:any,oldvalue:any){
        this._needRebuild=true;
    }

    setTarget(name: string|IK_Chain, target: IK_Target) {
        this._ik_sys.setTarget(name, target);
    }

    get chains(){
        return this._ik_sys.chains;
    }


    /**
     * 在动画开始之前，用来记录、恢复静态姿态
     */
    beforeOwnerAnim(){
        if(!this.enableSolver)
            return;
        for(let chain of this._ik_sys.chains){
            chain.resetStaticPose();
        }
        for(let lookat of this._ik_sys.lookats){
            lookat.resetStaticPose();
        }
    }

    onAwake(): void {
        super.onAwake();
        let constraintComp = this.owner.getComponent(BoneConstraints);
        if(constraintComp){
            this.constraints = constraintComp.constraints;
            this.owner.on(BoneConstraints.DATACHANGE,this,this.onConstraintDataChange);
        }
    }

    onDestroy(): void {
        this.showGizmos=false;
        this._ik_sys.showDbg=false;
        super.onDestroy();
        this.owner.off(BoneConstraints.DATACHANGE,this,this.onConstraintDataChange);
    }

    onUpdate() {
        if (this._needRebuild ) {
            //创建约束
            this._constraintsMap.clear();
            if(this._constraintDatas){
                this._constraintDatas.forEach(cdata=>{
                    // if(!cdata.enable)
                    //     return;
                    if(!cdata.bone)
                        return;
                    if(this._constraintsMap.get(cdata.bone)){
                        console.error('一个骨骼只能设置一个约束:',cdata.bone,name,cdata.bone);
                    }
                    let constraint:IK_ConstraintInstance=null;
                    let d2r = Math.PI/180;
                    switch(cdata.type){
                        //@ts-ignore
                        case 'hinge':
                            //let c = new IK_Constraint_Hinge(cdata.xmin*d2r,cdata.xmax*d2r);
                            //constraint = new IK_ConstraintInstance(c,getSpaceByDir(cdata.bone,cdata.axis));
                            cdata.ymin=0;cdata.ymax=0;
                            cdata.zmin=0;cdata.zmax=0;
                        case 'euler':{
							let c = new IK_Constraint_Euler(cdata.xmin*d2r,cdata.xmax*d2r, 
									cdata.ymin*d2r,cdata.ymax*d2r,
									cdata.zmin*d2r,cdata.zmax*d2r);
							constraint = this._createConstraintInstanceFromData(cdata, c);
                        }
                        break;
                        case 'swingtwist':{
							let c = new IK_Constraint_SwingTwist(cdata.xmax*d2r, 
									cdata.ymax*d2r,
									cdata.zmin*d2r,cdata.zmax*d2r);

							c.visual_height = cdata.visualHeight;
							c.visual_zheight = c.visual_height+0.1;
							constraint = this._createConstraintInstanceFromData(cdata, c);
                        }
                        break;
                        default:
                            break;
                    }
                    if(constraint){
                        this._constraintsMap.set(cdata.bone,constraint)
                    }
                });
                this._ik_sys.constraintsMap = this._constraintsMap;
            }
            //创建chain
            this._ik_sys.clear();
            this.chainDatas.forEach(data=>{
                if (!data.jointCount || !data.end || !data.enable )
                    return;
                let name = data.name;
                if (!name) {
                    name = data.end.name;
                }

                if(data.type=='position'){
                    let c = this._ik_sys.chreateChainByBoneName(this,data.end, data.jointCount);
                    c.enable = data.enable;
                    c.blendWeight = data.blendWeight;
                    c.poleTarget = data.PoleTarget?new IK_Target(data.PoleTarget):null;
                    //c.alignWithTarget = data.alignWithTarget;
                    this._ik_sys.addChain(c);
                    if(data.target)
                        this._ik_sys.setTarget(c, new IK_Target( data.target));
                    if(data.fixedEnd){
                        c.endFixed=true;
                    }
                    if(data.alignTarget && data.alignTarget!='no'){
                        c.endAlign=data.alignTarget;
                    }
                }else if(data.type=='lookat'){
                    if(data.lookJointCount){
                        let lookat = this._ik_sys.chreateLookatByEndSprite(this,data.end,data.lookJointCount);
                        if(lookat){
                            lookat.enable=data.enable;
                            //lookat.alignWithTarget = data.alignWithTarget;
                            this._ik_sys.lookats.push(lookat);
                            if(data.target){
                                lookat.target = new IK_Target(data.target);
                            }
                        }
                    }
                }
            })
            this._needRebuild = false;
        }else{
            this._updateConstraintSpace();
        }
        //应用ik结果
        this._ik_sys.onUpdate();

        if(LayaEnv.isPlaying && this._visualInPlay){
            if(!this._visualSp){
                let sp = this._visualSp = new PixelLineSprite3D();
                sp.name='ik visual'
                sp.maxLineCount=1000;
                let mtl = sp._render.material;
                mtl.renderQueue = 4001;
                mtl.depthTest= RenderState.DEPTHTEST_ALWAYS;
                this.owner._scene.addChild(sp);
            }
            this._visualSp.clear();
            this.visualize(this._visualSp);
        }

    }

	private _createConstraintInstanceFromData(cdata: IK_ConstraintData, c: IK_Constraint1): IK_ConstraintInstance {
		if(!cdata || !cdata.bone) return null;
		let inParent= new Matrix4x4();
		let parentMatW:Matrix4x4;
		if(cdata.bone.parent){
			parentMatW = (cdata.bone.parent as Sprite3D).transform.worldMatrix;
		}
		if(cdata.space){
			if(cdata.space.parent==cdata.bone){
				alert(`约束调整对象${cdata.space.name}不要放到当前关节下，建议放到当前关节的父下，否则初始化的时候会与当前关节的姿态有关`)
			}
			let constraintMat = cdata.space.transform.worldMatrix;
			let invMat = new Matrix4x4();
			if(parentMatW){
				parentMatW.invert(invMat);
				Matrix4x4.multiply(invMat,constraintMat,inParent);
			}else{
				constraintMat.cloneTo(inParent);
			}
			if(LayaEnv.isPlaying && cdata.space.name.startsWith('_ik')){
                //this._SpriteToClean.add(cdata.space);
                //删除会引起一些问题，例如别人重用，例如希望运行时动态修改，所以先不删除了
			}
		}else{
			//没有space则与parent对齐，但是加上位置偏移
			let pos = cdata.bone.transform.localPosition;
			inParent.elements[12] = pos.x; inParent.elements[13]=pos.y; inParent.elements[14]=pos.z;
		}
		let constraint = new IK_ConstraintInstance(c,inParent,cdata.constraintBone);
		constraint.data = cdata;
		constraint.enable = cdata.enable;
		return constraint;
	}    

    //约束的动态修改.
    private _updateConstraintSpace(){
        for (let [bone, constraint] of this._constraintsMap) {
            let inParent= constraint.inParent;  //直接修改
            let data = constraint.data;
            if(data.space && !data.space.destroyed){
                let parentMatW:Matrix4x4;
                if(data.bone.parent){
                    parentMatW = (data.bone.parent as Sprite3D).transform.worldMatrix;
                }
                let constraintMat = data.space.transform.worldMatrix;
                let invMat = new Matrix4x4();
                if(parentMatW){
                    parentMatW.invert(invMat);
                    Matrix4x4.multiply(invMat,constraintMat,inParent);
                }else{
                    constraintMat.cloneTo(inParent);
                }
            }else{
                //没有space则与parent对齐，但是加上位置偏移
                // let pos = data.bone.transform.localPosition;
                // inParent.elements[12] = pos.x; inParent.elements[13]=pos.y; inParent.elements[14]=pos.z;
            }
        }           
    }

    visualize(v:ILinerender){
        this._ik_sys.visualize(v);
    }
}
