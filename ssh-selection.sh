#!/bin/bash

pushd `dirname $0`

name=$1
uuid=$(node uuid.js)

node index.js $name $uuid

ip=`cat $uuid`
echo ssh into $ip
rm $uuid
ssh -vv $ip

popd
