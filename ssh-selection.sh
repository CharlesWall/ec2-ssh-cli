#!/bin/bash

# from http://stackoverflow.com/questions/59895/getting-the-source-directory-of-a-bash-script-from-within
function getSourceDirectory() {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
  done
  printf "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

pushd `getSourceDirectory`

name=$1
uuid=$(node uuid.js)

set -e
node index.js $name $uuid

command=`cat $uuid`
rm $uuid
echo $command
$command

popd
