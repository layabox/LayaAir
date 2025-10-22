import { Camera } from "../../d3/core/Camera";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { BoundBox } from "../../d3/math/BoundBox";
import { Color } from "../../maths/Color";
import { Vector3 } from "../../maths/Vector3";
import { ILinerender } from "../LineRender";
import { Bone3D } from "./Bone3D";
import { drawAxis } from "./RenderUtils";


var v1 = new Vector3();
var v2 = new Vector3();

export class Skeleton3D{
    private _visualSp:ILinerender;
    showBone=true
    private _bones:Bone3D[]=[];
    private _bounds = new BoundBox(new Vector3(),new Vector3());
    private _editorCamera:Camera = null;
    enablePick=false;
    //如果选中了多个，多次相同的话，每次选择不同的
    private _curPickedBone:Bone3D=null;
    private _lastMouseX=0;
    private _lastMouseY=0;
    private _useGizmo=true;
    owner:Sprite3D;

    get pickedParent(){
        return this._curPickedBone?.parent;
    }

    get pickedChild(){
        return this._curPickedBone?.child;
    }

    get pickdName(){
        return this._curPickedBone?.name;
    }

    showAxis=false;

    axisLength=0.3

    onAwake(owner:Sprite3D){
        this.owner = owner;
        // if(!this._useGizmo && !this._visualSp){
        //     let scene = (this.owner as Sprite3D).scene;
        //     let sp = this._visualSp = new PixelLineSprite3D();
        //     sp.name='skeleton visual'
        //     sp.maxLineCount=1000;
        //     let mtl = sp._render.sharedMaterial;
        //     mtl.depthTest= RenderState.DEPTHTEST_ALWAYS;
        //     mtl.renderQueue = 4000;
        //     scene.addChild(sp);
        // }

        this._bones.length=0;
        this.traverseChildren(owner,(parent:Sprite3D,child:Sprite3D)=>{
            if(parent && child)
                this._bones.push(new Bone3D(parent.name+'->'+child.name,parent,child));
        });
    }

    
    visualize(liner:ILinerender){
        if(this.showBone){
            this._visualSp = liner;
            let root = this.owner as Sprite3D;
            this.traverseChildren(root,this._addLine.bind(this));
        }
    }



    private _addLine(parent: Sprite3D, child: Sprite3D) {
        if(!child)return;
        let pcolor = Color.RED;
        let ccolor = Color.GREEN;
        let liner = this._visualSp;
        if(this._curPickedBone){
            if(this._curPickedBone.parent == parent && this._curPickedBone.child==child){
                pcolor = Color.WHITE;
                ccolor = Color.WHITE;

                if(this.showAxis){
                    drawAxis(liner,parent.transform.worldMatrix,this.axisLength);
                    // let ori = parent.transform.position;
                    // let e = parent.transform.worldMatrix.elements;
                    // let axLen=this.axisLength;
                    // v1.set(e[0],e[1],e[2]).normalize().scale(axLen,v1);
                    // ori.vadd(v1,v2);
                    // liner.addLine(ori,v2,Color.RED,Color.RED);
                    // v1.set(e[4],e[5],e[6]).normalize().scale(axLen,v1);
                    // ori.vadd(v1,v2);
                    // liner.addLine(ori,v2,Color.GREEN,Color.GREEN);
                    // v1.set(e[8],e[9],e[10]).normalize().scale(axLen,v1);
                    // ori.vadd(v1,v2);
                    // liner.addLine(ori,v2,Color.BLUE,Color.BLUE);
                }
            }
        }
        liner.addLine(
            parent.transform.position,
            child.transform.position,
            pcolor,
            ccolor
        );
    }

    traverseChildren(parent: Sprite3D, f:(parent:Sprite3D,child:Sprite3D)=>void): void {
        if(parent.name=='joints')
            return;
        if(!parent.children||parent.children.length==0){
            f(parent,null)
        }
        parent.children.forEach(child => {
            if (child instanceof Sprite3D) {
                let childsp = child as Sprite3D
                f(parent,childsp);
                this.traverseChildren(childsp,f);
            }
        });
    }
}
