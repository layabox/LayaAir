import { BaseRender } from "../render/BaseRender";
import { ReflectionProbe } from "./ReflectionProbe";
import { ReflectionProbeList } from "./ReflectionProbeList";
import { SingletonList } from "../../component/SingletonList";  
import { Bounds } from "../Bounds";

/**
 *<code>ReflectionProbeManager</code> 类用于反射探针管理
 * @miner 
 */
export class ReflectionProbeManager {

    /** @internal 反射探针队列 */
    private _reflectionProbes:ReflectionProbeList = new ReflectionProbeList();
    /** @internal 环境探针 */
    private _sceneReflectionProbes:ReflectionProbe;
    /** @internal 需要跟新反射探针的渲染队列 */
    private _motionObjects:SingletonList<BaseRender> =  new SingletonList<BaseRender>();
    
    /**
     * 更新baseRender的反射探针
     * @param baseRender 
     */
    _updateMotionObjects(baseRender:BaseRender):void{
        var elements:ReflectionProbe[] = this._reflectionProbes.elements;
        var maxOverlap:number = 0;
        var mainProbe:ReflectionProbe;
        var renderBounds:Bounds = baseRender.bounds;
        var overlop ;
        for(var i:number = 0,n:number = this._reflectionProbes.length;i<n;i++){
            var renflectProbe = elements[i];
            if(!mainProbe){
                overlop = renderBounds.calculateBoundsintersection(renflectProbe.bounds);
                if(overlop <maxOverlap) continue;   
            }else{
                if(mainProbe.importance>renflectProbe.importance) continue;//重要性判断
                overlop = renderBounds.calculateBoundsintersection(renflectProbe.bounds);
                if(overlop <maxOverlap && mainProbe.importance == renflectProbe.importance) continue;  
            }
            mainProbe = renflectProbe;
            maxOverlap = overlop;
        }
        if(!mainProbe&&this._sceneReflectionProbes)//如果没有相交 传场景反射球
            mainProbe = this._sceneReflectionProbes;
     }
    
    /**
     * 场景中添加反射探针
     * @internal
     * @param reflectionProbe 
     */
    add(reflectionProbe:ReflectionProbe){
        this._reflectionProbes.add(reflectionProbe);
    }

    /**
     * 场景中删除反射探针
     * @internal
     * @param reflectionProbe 
     */
    remove(reflectionProbe:ReflectionProbe){
        this._reflectionProbes.remove(reflectionProbe);
    }

    
    /**
	 * 添加运动物体。
	 * @param 运动物体。
	 */
    addMotionObject(renderObject:BaseRender){
        this._motionObjects.add(renderObject);
    }

   

    update():void{
        if(this._reflectionProbes.length==0)
            return;
        var elements: BaseRender[] = this._motionObjects.elements;
        for(var i:number = 0,n:number = this._motionObjects.length;i<n;i++){
            this._updateMotionObjects(elements[i]);
        }
    }

    /**
     * Scene中的所有渲染物体更新反射探针
     */
    updateAllRenderObjects(){
        
    }

    

    //清除所有Profab
    clearMotionObjects(){
        this._motionObjects.length = 0;
    }

    destroy(){

    }
}


