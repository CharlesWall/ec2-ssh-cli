#!/usr/bin/env node

const aws = require('aws-sdk')
const ec2 = new aws.EC2({region: 'us-east-1'});

const tmpdir = require('os').tmpdir();
const fs = require('fs');
const [name, outputFile] = process.argv.slice(2);

function writeToFile(instanceIpAddress) {
  return new Promise((resolve, reject) => {
    console.log({outputFile});

    fs.writeFile(outputFile, instanceIpAddress, err => {
      err ? reject(err) : resolve();
    });
  });
}

async function createMenu(items) {
  let menu = require('node-menu').resetMenu();

  return new Promise((resolve, reject) => {
    items.forEach((instance)  => {
      let {PrivateIpAddress, InstanceId} = instance;
      menu = menu.addItem(`${PrivateIpAddress} ${InstanceId}`, () => { resolve(instance); });
    });

    menu.start();
  });
}

async function getInstances() {
  let Filters = [{
    Name: 'tag:Name',
    Values: [ name ]
  }];

  let foundInstances = [];
  (await ec2.describeInstances({ Filters }).promise()).Reservations.forEach(({Instances}) => {
    Instances.forEach(instance => foundInstances.push(instance));
  });

  return foundInstances;
}


(async function selectInstance() {
    
  const foundInstances = await getInstances();

  console.log({foundInstances});

  let selectedInstance = await createMenu(foundInstances);

  console.log({selectedInstance});

  await writeToFile(selectedInstance.PrivateIpAddress);

  console.log('ending');

  process.exit(0);
})();
