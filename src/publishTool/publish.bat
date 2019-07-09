@echo off
if exist ..\..\build (
   rmdir /s/q ..\..\build
) 
node index.js

cd ..\layaAir
gulp build

@pause