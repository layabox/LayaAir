import { Config } from "../layaAir/Config";
import { Laya } from "../layaAir/Laya";

//如果要canvas.toBlob必须保留buffer，否则会黑屏
Config.preserveDrawingBuffer=true;

Laya.addInitCallback(()=>{
    //这时候已经初始化完成，这个值不再能控制canvas的属性，但是设置为false可以保证能clear
    Config.preserveDrawingBuffer=false;
})

//为了避免循环引用，直接使用原生的事件
let stx=0;
let sty=0;
document.addEventListener('mousedown',(e:MouseEvent)=>{
    if(e.button === 2){
        stx = e.clientX;
        sty = e.clientY;
    }
})
document.addEventListener('mouseup',(e:MouseEvent)=>{
    if(e.button === 2){
        let time = (window as any).testtime||300;
        captureAndSend(null,[{time,rect:{x:stx,y:sty,width:e.clientX-stx,height:e.clientY-sty}}]);
    }
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