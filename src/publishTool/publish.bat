cd ..\layaAir
rollup -c rollup.publish.config.js

cd ..\publishTool
node index.js
@pause