@echo off
if exist .\out (
    rmdir /s/q .\out
)


if exist .\doc (
    rmdir /s/q .\doc
)

node generateDoc.js
gulp buildAPI
@pause