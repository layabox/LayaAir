window.Physics3D = function (initialMemory, interactive) {
  return new Promise((resolve) => {
    var mem = new WXWebAssembly.Memory({ initial: initialMemory });
    
    // fetch("libs/laya.physics3D.wasm.wasm").then((response) => {
    //   response.arrayBuffer().then((buffer) => {
        WXWebAssembly.instantiate("libs/laya.physics3D.wasm.wasm", {
          LayaAirInteractive: interactive,
          wasi_unstable: {
            fd_close: () => { console.log('fd_close'); },
            fd_seek: () => { console.log('fd_seek'); },
            fd_write: () => { console.log('fd_write'); }
          },
          env: {
            memory: mem,
          }
        }).then((physics3D) => {
          window.Physics3D = physics3D.instance.exports;
          resolve();
        });
    //   });
    // });
  });
};
