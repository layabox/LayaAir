window.Physics3D = function (initialMemory, interactive) {
  return new Promise((resolve) => {
    var mem = new WebAssembly.Memory({ initial: initialMemory });
    fetch("laya.physics3D.wasm.wasm").then((response) => {
      response.arrayBuffer().then((buffer) => {
        WebAssembly.instantiate(buffer, {
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
      });
    });
  });
};
