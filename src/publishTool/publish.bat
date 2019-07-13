@echo off
if exist ..\..\build (
   rmdir /s/q ..\..\build
) 
node index.js

cd ..\
gulp build

@pause