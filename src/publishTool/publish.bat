@echo off
if exist ..\..\build (
   rmdir /s/q ..\..\build
) 

if exist ..\..\bin\tsc\layaAir (
   rmdir /s/q ..\..\bin\tsc\layaAir
) 
node index.js

cd ..\
gulp build

@pause