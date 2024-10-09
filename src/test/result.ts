import { Config } from "../layaAir/Config";
import { Laya } from "../layaAir/Laya";

//如果要canvas.toBlob必须保留buffer，否则会黑屏
Config.preserveDrawingBuffer=true;

Laya.addInitCallback(()=>{
    //这时候已经初始化完成，这个值不再能控制canvas的属性，但是设置为false可以保证能clear
    Config.preserveDrawingBuffer=false;
})

export async function captureAndSend(pageId:string|null,testInfo:{time:number,rect:{x:number,y:number,width:number,height:number}}[]) {
    const startTime = Date.now();
    pageId = pageId || window.location.search.substring(1);
    let i=0;
    let tm=0;
    for (let item of testInfo) {  
      await new Promise(resolve => setTimeout(resolve, item.time-tm));
      tm=item.time;
      
      // 获取指定的canvas元素
      const canvas = document.getElementById('layaCanvas') as HTMLCanvasElement;
      
      if (!canvas) {
        console.error('Canvas with id "layaCanvas" not found');
        continue;
      }
      
      // 将canvas转为blob
      const blob:Blob = await new Promise(resolve => canvas.toBlob(resolve as any));

    //   const dataUrl = canvas.toDataURL('image/png');
    //   const blob = await (await fetch(dataUrl)).blob();      
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('screenshot', blob, 'screenshot.png');
      formData.append('testInfo', JSON.stringify(item));
      formData.append('pageId', pageId);
      formData.append('frame',''+i);
      i++;
      
      // 发送到服务器
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      // 保存返回的路径
      console.log('save:',result.path);
    }
    
    console.log('All screenshots captured and sent');
  }