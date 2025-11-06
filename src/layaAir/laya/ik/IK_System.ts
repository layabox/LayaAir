import { IK_CCDSolver } from "./IKSolver/IK_CCD_Solver";
import { IK_Chain } from "./IK_Chain";
import { IK_ISolver } from "./IK_ISolver";
import { IK_Joint } from "./IK_Joint";
import { IK_Target } from "./IK_Target";
import { delay, quaternionFromTo } from "./IK_Utils";
import { IK_FABRIK_Solver } from "./IKSolver/IK_FABRIK_Solver";
import { IK_Comp } from "./IK_Comp";
import { IK_ConstraintInstance } from "./IK_Constraint";
import { IK_Lookat } from "./IK_Lookat";
import { IK_AnimLayer } from "./IK_AnimLayer";
import { Sprite3D } from "../d3/core/Sprite3D";
import { ILinerender } from "./LineRender";

export class SHOW_DBG{
    static CONSTRAINT=1;
    static CONSTRAINT_AXIS=1<<2;
    static BONE=1<<3;
    static BONE_AXIS=1<<4;
    static ALL=0xff;

    static showdbg = SHOW_DBG.ALL;

    static none(){
        SHOW_DBG.showdbg=0;
        return SHOW_DBG;
    }
    static all(){
        SHOW_DBG.showdbg=SHOW_DBG.ALL;
        return SHOW_DBG;
    }
    static add(flag:number){
        SHOW_DBG.showdbg|=flag;
        return SHOW_DBG;
    }
    static sub(flag:number){
        SHOW_DBG.showdbg&=(~flag)
        return SHOW_DBG;
    }
    static has(flag:number){
        return (SHOW_DBG.showdbg&flag)!==0;
    }
}

//一个可以整体移动的系统，例如一个人身上的多个链
export class IK_System {
    static version = "0.1.0";
    private solver: IK_ISolver;
    chains: IK_Chain[] = [];
    lookats:IK_Lookat[]=[];
    private rootSprite:Sprite3D = null;
    private _showDbg = false;
    //private _visualSp:PixelLineSprite3D=null
    //private _scene:Scene3D;
    constraintsMap:Map<Sprite3D,IK_ConstraintInstance>;
    enableSolver=true;
    owner:Sprite3D = null;
    useAnimLayer=false;

    constructor(owner:Sprite3D) {
        this.solver = new IK_CCDSolver();
        //this.solver = new IK_FABRIK_Solver();
        //this._scene = scene;
        this.owner = owner;
        //debug
        (window as any).iks = this;
    }
    
    setRoot(r:Sprite3D){
        this.rootSprite=r;
    }

    setMaxIterations(v:number){
        this.solver.maxIterations = v;
    }

    setDampingFactor(v:number){
        this.solver.dampingFactor = v;
    }
    getDampingFactor(){
        return this.solver.dampingFactor;
    }

    set showDbg(b:boolean){
        this._showDbg=b;
        for(let chain of this.chains){
            chain.showDbg = b;
        }
        // if(b){
        //     if(!this._visualSp){
        //         let sp = this._visualSp = new PixelLineSprite3D();
        //         sp.name='ik visual'
        //         sp.maxLineCount=1000;
        //         let mtl = sp._render.material;
        //         mtl.renderQueue = 4001;
        //         mtl.depthTest= RenderState.DEPTHTEST_ALWAYS;
        //         this._scene.addChild(sp);
        //     }
        // }else{
        //     if(this._visualSp){
        //         this._visualSp.destroy();
        //         this._visualSp=null;
        //     }
        // }
    }

    get showDbg(){
        return this._showDbg;
    }

    visualize(liner:ILinerender){
        if(this._showDbg){
            for(let chain of this.chains){
                chain.visualize(liner);
            }
            for(let lookat of this.lookats){
                lookat.visualize(liner);
            }
        }
    }

    /**
     * 可以包含多个chain
     * @param chain 
     */
    addChain(chain: IK_Chain) {
        this.chains.push(chain);
        chain.solver = this.solver;
    }

    clear(){
        this.chains.length=0;
        this.lookats.length=0;
    }

    private _getChildByName(sp:Sprite3D, name:string):Sprite3D|null{
        if (sp.name === name) {
            return sp;
        }
    
        const childCount = sp.numChildren;
        // 递归查找所有子节点
        for (let i = 0; i < childCount; i++) {
            const child = sp.getChildAt(i) as Sprite3D;
            
            // 递归调用
            const result = this._getChildByName(child, name);
            if (result !== null) {
                return result;
            }
        }
    
        // 如果没有找到，返回null
        return null;    
    }

    /**
     * 根据给定的id或者名字找到一条链
     * @param name 
     * @param length 链的长度
     * 返回的骨骼的顺序是从末端到根
     */
    getBoneChain(name:string,length:number){
        let end = this._getChildByName(this.rootSprite,name);
        return this.getBoneChainBySprite(end,length);
    }

    getBoneChainBySprite(end:Sprite3D,length:number){
        if(!end)return null;
        let ret:Sprite3D[]=[end];
        let cur = end;
        for(let i=0; i<length-1; i++){
            cur = cur.parent as Sprite3D;
            if(!cur){
                break;
            }
            if(!(cur instanceof Sprite3D))
                break;
            ret.push(cur);
        }
        return ret;
    }    

    chreateChainByBoneName(comp:IK_Comp, nameOrSp3d:string|Sprite3D, length:number):IK_Chain{
        let bones:Sprite3D[];
        let endName:string;
        if(typeof nameOrSp3d=='string'){
            endName = nameOrSp3d;
            bones = this.getBoneChain(nameOrSp3d,length);
        }else if(nameOrSp3d instanceof Sprite3D){
            endName = nameOrSp3d.name;
            bones = this.getBoneChainBySprite(nameOrSp3d,length);
        }
        if(!bones || bones.length!=length){
            console.error(`没有找到骨骼:${endName}或者长度不足${length}`)
            return null;
        }
        let chain = new IK_Chain('',comp);
        
        //创建chain
        //确定对应关系
        for(let i=length-1; i>=0; i--){
            const curnode = bones[i];   //前面的是根
            //注意按照从根到末端的顺序
            const joint = new IK_Joint(curnode);
            if(this.constraintsMap){
                let constraint = this.constraintsMap.get(curnode);
                joint.constraint = constraint;
            }
            chain.addJoint(joint);
        }
        chain.onLinkEnd();
        //this.chains.push(chain);
        return chain;
    }

    chreateLookatByEndSprite(comp:IK_Comp, end:Sprite3D, length:number):IK_Lookat{
        let bones:Sprite3D[];
        // if(length>2){
        //     console.error('looat 长度最大为2');
        //     length=2;
        // }
        let name = end.name;
        bones = this.getBoneChainBySprite(end,length);
        if(!bones || bones.length!=length){
            console.error(`没有找到骨骼:${name}或者长度不足${length}`)
            return null;
        }
        // if(bones.length==2){
        //     //颠倒一下，让0永远是可调节的那个骨骼
        //     bones = [bones[1],bones[0]];
        // }
        let joints:IK_Joint[]=[];
        for(let b of bones){
            let joint = new IK_Joint(b);
            if(this.constraintsMap){
                joint.constraint = this.constraintsMap.get(b);
            }
            joints.push(joint);
        }
        let lookat = new IK_Lookat(joints,comp);
        return lookat;
    }    

    private _findChainByName(name:string){
        for(let chain of this.chains){
            if(chain.name==name){
                return chain;
            }
        }
        return null;
    }

    setTarget(endEffectorName:string|IK_Chain, target:IK_Target){
        let chain:IK_Chain=null;
        if(endEffectorName instanceof IK_Chain){
            chain = endEffectorName;
        }else{
            chain = this._findChainByName(endEffectorName);
        }
        if(!chain)
            return;
        chain.target = target;
    }

    resetPose(){
        for(let chain of this.chains){
            chain.captureStaticPose();
        }
        for(let lookat of this.lookats){
            lookat.captureStaticPose();
        }
    }

    async onUpdate(){
        // if(this._visualSp){
        //     this._visualSp.clear();
        // }

        for(let chain of this.chains){
            let isRunning = this.enableSolver && chain.enable;
            chain.isRunning=isRunning;
            if(this.useAnimLayer){
                if(isRunning){
                    chain.captureAnimPose();
                    chain.copyInitPose();
                    //chain.copyCurPoseAsInitPose();
                    chain.solve();
                    chain.ik_result.captureIKResult(chain.joints);
                    chain.layerMgr.set(chain.ik_result);
                    chain.applyResult();                    
                }
                if(chain.isFading()){
                    chain.applyResult();
                }
            }else{
                if(isRunning){
                    chain.copyCurPoseAsInitPose();
                    chain.solve();
                    chain.applyIKResult();
                }
            }                
        }
        for(let lookat of this.lookats){
            let isRunning = this.enableSolver && lookat.enable;
            lookat.isRunning = isRunning;
            if(this.useAnimLayer){
                if(isRunning){
                    lookat.captureAnimPose();
                    lookat.copyInitPose();
                    lookat.solve();
                    lookat.ik_result.captureIKResult(lookat.joints);
                    lookat.layerMgr.set(lookat.ik_result);
                    lookat.applyResult();
                }
                if(lookat.isFading()){
                    lookat.applyResult();
                }
            }else{
                if(isRunning){
                    lookat.captureAnimPose();
                    lookat.copyInitPose();
                    lookat.solve();
                    lookat.applyIKResult();
                }
            }
        }
        //this.visualize();
    }

}
