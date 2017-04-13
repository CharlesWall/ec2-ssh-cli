#!/usr/bin/env node

const aws = require('aws-sdk')
const ec2 = new aws.EC2({region: 'us-east-1'});

const tmpdir = require('os').tmpdir();
const fs = require('fs');
const [name, outputFile] = process.argv.slice(2);

const QUIT = 'Quit'

function writeToFile(instanceIpAddress) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, instanceIpAddress, err => {
      err ? reject(err) : resolve();
    });
  });
}

async function createMenu(items) {
  let choices = items.map((instance) => {
    //console.log(JSON.stringify(instance, null, 4));
    let { InstanceId, PrivateIpAddress, State, Tags } = instance
    let version, cluster;
    try {
      version = Tags.find(tag => tag.Key === "version").Value;
    } catch (error) {
      cluster = "Unknown";
    }
    try {
      instanceName = Tags.find(tag => tag.Key === "Name").Value;
    } catch (error) {
      instanceName = "Unknown";
    }

    return `${instanceName} ${version} ${InstanceId} ${State.Name} ${PrivateIpAddress}`;
  }).sort();


  // allow the choice to quit
  choices.push(QUIT);

  return require('inquirer').prompt({
    type: 'list',
    name: 'answer',
    message: 'Select the instance you want to ssh into:',
    choices
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
  try {
    const foundInstances = await getInstances();

    let { answer } = await createMenu(foundInstances);

    if (answer === QUIT) {
      // exit with exit code 2 (user quit)
      return process.exit(2);
    }

    let answerArray = answer.split(' ');
    let privateIpAddress = answerArray[answerArray.length - 1];

    await writeToFile(privateIpAddress);

    // everything good, exit with code 0 (all good)
    process.exit(0);
  } catch (err) {
    console.error(err)
    // return with exit code 1 (error)
    process.exit(1);
  }
})();
