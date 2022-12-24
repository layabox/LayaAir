import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/maths/Vector3";
import { GrassCellInfo } from "./GrassCellInfo";
import { GlassRender } from "./GrassRender";

/**
 * 用来管理草皮，裁剪什么的都在这里
 */
export class GrassRenderManager{
    //----------config-----------
    //最大Instance数  也是密度
    public instanceCount = 1000000;
    //设置草皮大小
    public grassCellsize = 10;
    //设置草皮最大草量
    public cellMaxGrassNum = 1000;
    //设置草量的级数
    public cellMipmapByDistance = 10;
    //裁剪最近距离
    public DrawDistance = 150;
    //是否开启草地分级优化
    public enableLevelDraw = true;
    //每降低一个等级草量减少百分比
    public subGrassByLevel = 0.1;


    /**裁剪后决定 渲染草地数目 */
    public drawGrassCellNums:number;
    /**渲染级别草坪队列 */
    private drawGrassCellLeverlArray:Array<{[key:number]:number}>;
    /**渲染级别草坪渲染个数 */
    private drawGrassLevelNums:Array<number>;
    /**草皮Map*/
    private grassMap:Array<GrassCellInfo> = [];

    //更新数据
    public dataArrayBuffer:Float32Array;
    //更新绘画个数
    public drawArrayLength:number = 0;
    //buffer材质管理器
    public glassRender:GlassRender;

    /**
     * 草坪渲染管理
     */
    constructor(camera:Camera){
        this.drawGrassCellLeverlArray = [];
        this.drawGrassCellLeverlArray.length = this.cellMipmapByDistance;
        for (let index = 0; index < this.cellMipmapByDistance; index++) {
          this.drawGrassCellLeverlArray[index] = [];
        }
        this.drawGrassLevelNums = [];
        this.drawGrassLevelNums.length = this.cellMipmapByDistance;
        this.dataArrayBuffer = new Float32Array(this.instanceCount*3);

        this.glassRender = new GlassRender(this,camera);
    }


  

	set enable(value: boolean) {
		if(value)
            this.glassRender.addCommandBuffer();
        else
            this.glassRender.removeCommandBuffer();
	}


    /**
     * 草皮裁剪
     */
    frustumCulling(camera:Camera){
       //等级渲染清理
        for(let j = 0;j<this.drawGrassLevelNums.length;j++){
            this.drawGrassLevelNums[j] = 0;
        }
        this.drawGrassCellNums = 0;
        let distance =this.DrawDistance;
        let levelDistance = this.DrawDistance/this.cellMipmapByDistance;
        let boundFrustum = camera.boundFrustum;
        let cameraPos = camera.transform.position;
        for(let i = 0,n = this.grassMap.length;i<n;i++){
            let grasscell = this.grassMap[i];
            let grassDistance = Vector3.distance(grasscell.privotPos,cameraPos)
            if(grassDistance<distance){
                //TODO优化
                if(boundFrustum.intersects(grasscell.bound)){
                    if(this.enableLevelDraw){
                        let leval = Math.floor(grassDistance/levelDistance);
                        grasscell.setDrawLevel(leval*this.subGrassByLevel);
                        this.drawGrassCellLeverlArray[leval] ||  (this.drawGrassCellLeverlArray[leval]={});
                        //@ts-ignore
                        this.drawGrassCellLeverlArray[leval][this.drawGrassLevelNums[leval]]= i; 
                        //@ts-ignore
                        this.drawGrassLevelNums[leval] += 1;
                    }
                    else{
                        grasscell.setDrawLevel(0);
                        this.drawGrassCellLeverlArray[0][this.drawGrassLevelNums[0]]= i; 
                        //@ts-ignore
                        this.drawGrassLevelNums[0] += 1;
                    }
                    this.drawGrassCellNums++;
                }
            }
        }
    }

    /**
     * 增加草坪块
     */
    addGrassCell(grassPrivot:Vector3){
        let grassCell = new GrassCellInfo(this.cellMaxGrassNum,this.grassCellsize,grassPrivot);
        this.grassMap.push(grassCell);
    }

    /**
     * 删除草坪块
     */
    removeGrassCell(grassCell:GrassCellInfo){
        let index = this.grassMap.indexOf(grassCell);
        let lastIndex = this.grassMap.length - 1;
        this.grassMap[index] = this.grassMap[lastIndex];
        this.grassMap.length = lastIndex;
    }

    update(caemra:Camera){
        //根据距离排序更新 最后渲染
        this.frustumCulling(caemra);
        let offset = 0;
        for(let i = 0,n = this.drawGrassLevelNums.length;i<n;i++){
            let drawnums = this.drawGrassLevelNums[i];
            var array = this.drawGrassCellLeverlArray[i];
            for(var j = 0;j<drawnums;j++){
                offset =this.grassMap[array[j]].setGrassCellData(this.dataArrayBuffer,offset);
            }
        }
        this.drawArrayLength = offset/3;
        this.glassRender.changeDrawNums();
    }
    


}
