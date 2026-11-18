// Serve the repository root and open tests/input-coordinates/index.html.
// Uses DOM event listeners and browser layout, not a copy of the conversion formula.
(async () => {
    await Laya.init(320, 240);
    const stage = Laya.stage;
    const canvas = Laya.Browser.mainCanvas.source;
    const container = canvas.parentElement;
    const outer = document.createElement('div');
    container.before(outer);
    outer.appendChild(container);
    const target = new Laya.Sprite();
    target.pos(20, 20);
    target.size(80, 60);
    target.graphics.drawRect(0, 0, 80, 60, '#00aa66');
    stage.addChild(target);
    const marker = document.createElement('div');
    marker.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;pointer-events:none';
    container.appendChild(marker);
    let observed;
    for (const type of [Laya.Event.MOUSE_DOWN, Laya.Event.MOUSE_MOVE]) {
        target.on(type, null, e => { observed = { x: e.stageX, y: e.stageY, hit: e.target === target }; });
    }
    const cases = [
        ['default zero-height container', () => {}],
        ['zero-height translated/scaled parent', () => { container.style.transform = 'translate(100px,70px) scale(.5)'; }],
        ['bordered scaled parent', () => { container.style.cssText += 'position:relative;width:1000px;height:500px;border:10px solid black;transform:translate(100px,70px) scale(.5);transform-origin:0 0;'; }],
        ['nested unequal scales', () => { outer.style.transform = 'translate(40px,25px) scale(.8,1.2)'; container.style.transform = 'translate(20px,30px) scale(.5,.7)'; }],
        ['scrolling bordered ancestor', () => { outer.style.cssText += 'width:240px;height:140px;overflow:scroll;border:8px solid black;'; container.style.cssText += 'position:relative;width:800px;height:600px;'; outer.scrollLeft=15; outer.scrollTop=10; }],
        ['document scroll', () => { document.body.style.height='2000px'; outer.style.marginTop='300px'; window.scrollTo(0,200); }],
        ['Stage showall and alignment', () => { stage.scaleMode=Laya.Stage.SCALE_SHOWALL; stage.alignH=Laya.Stage.ALIGN_CENTER; stage.alignV=Laya.Stage.ALIGN_MIDDLE; stage.setScreenSize(700,500); container.style.transform='translate(40px,25px) scale(.5)'; }],
        ['Stage horizontal rotation', () => { stage.screenMode=Laya.Stage.SCREEN_HORIZONTAL; stage.setScreenSize(300,600); container.style.transform='translate(80px,70px) scale(.5,.75)'; }],
        ['Stage vertical rotation', () => { stage.screenMode=Laya.Stage.SCREEN_VERTICAL; stage.setScreenSize(600,300); container.style.transform='translate(80px,70px) scale(.5,.75)'; }],
        ['Stage client scale', () => { stage.scale(1.5,1.25); container.style.transform='translate(80px,70px) scale(.5)'; }]
    ];
    const results=[];
    for (const [name, setup] of cases) {
        window.scrollTo(0,0);
        document.body.style.height='';
        outer.style.cssText='transform-origin:0 0;';
        container.style.cssText='transform-origin:0 0;';
        stage.screenMode=Laya.Stage.SCREEN_NONE;
        stage.scaleMode=Laya.Stage.SCALE_NOSCALE;
        stage.alignH=Laya.Stage.ALIGN_LEFT;
        stage.alignV=Laya.Stage.ALIGN_TOP;
        stage.scale(1,1);
        stage.setScreenSize(320,240);
        // Avoid mouse suppression immediately after the preceding touch event.
        await new Promise(resolve => setTimeout(resolve,130));
        setup();
        // A DOM marker identifies the visual position of stage point (48,48).
        // The browser applies all layout, borders, scrolling and CSS transforms.
        marker.style.transform=canvas.style.transform + ` translate(${48*stage.clientScaleX}px,${48*stage.clientScaleY}px)`;
        const r=marker.getBoundingClientRect();
        for (const kind of ['mouse','touch']) {
            observed=null;
            if(kind==='mouse') {
                canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:Math.round(r.x),clientY:Math.round(r.y),button:0,bubbles:true,cancelable:true}));
            } else {
                const touch=new Touch({identifier:1,target:canvas,clientX:r.x,clientY:r.y,pageX:r.x+scrollX,pageY:r.y+scrollY});
                canvas.dispatchEvent(new TouchEvent('touchstart',{touches:[touch],targetTouches:[touch],changedTouches:[touch],bubbles:true,cancelable:true}));
            }
            // MouseEvent stores integer CSS pixels. After rounding the visual point,
            // these scales can differ by one stage pixel; Touch preserves fractions.
            const tolerance=kind==='mouse'?1.01:.01;
            const pass=!!observed && observed.hit && Math.abs(observed.x-48)<tolerance && Math.abs(observed.y-48)<tolerance;
            results.push({name,kind,pass,observed,rotation:stage.canvasDegree,client:[r.x,r.y],transform:canvas.style.transform});
            if(kind==='mouse') {
                canvas.dispatchEvent(new MouseEvent('mouseup',{clientX:Math.round(r.x),clientY:Math.round(r.y),button:0,bubbles:true,cancelable:true}));
            } else {
                const touch=new Touch({identifier:1,target:canvas,clientX:r.x,clientY:r.y,pageX:r.x+scrollX,pageY:r.y+scrollY});
                canvas.dispatchEvent(new TouchEvent('touchend',{touches:[],targetTouches:[],changedTouches:[touch],bubbles:true,cancelable:true}));
            }
        }
    }
    window.inputCoordinateResults=results;
    document.getElementById('results').textContent=results.map(r=>`${r.pass?'PASS':'FAIL'} ${r.name}: ${r.kind} ${JSON.stringify(r.observed)}`).join('\n');
})().catch(error=>{window.inputCoordinateError=error.stack;document.getElementById('results').textContent=error.stack;});
