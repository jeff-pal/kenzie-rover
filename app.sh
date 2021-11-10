#!/bin/bash

CONTAINERNAME="cont-kz-rover"
IMAGENAME="img-kz-rover"

if [ -p /dev/stdin ] || [ input="&0" ]; then
    cat | docker run -i --name ${CONTAINERNAME} ${IMAGENAME} npm start --silent        
else
    echo "No input was found on stdin! Please run this command: $0 < your-file"
fi

docker stop ${CONTAINERNAME}  > /dev/null 2>&1
docker rm ${CONTAINERNAME} > /dev/null 2>&1