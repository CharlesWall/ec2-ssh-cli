#!/usr/bin/env node

const aws = require('aws-sdk')
const ec2 = new aws.EC2({region: 'us-east-1'});

const tmpdir = require('os').tmpdir();
const fs = require('fs');
const inquirer = require('inquirer');
const [name, outputFile] = process.argv.slice(2);

const BACK = 'Back';
const SSH = 'ssh';
const INFO = 'Info';
const QUIT = 'Quit';
const YML = require('js-yaml');

function writeToFile(instanceIpAddress) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, instanceIpAddress, err => {
      err ? reject(err) : resolve();
    });
  });
}

async function createInstanceMenu(items) {
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

    return `${InstanceId} ${instanceName} ${version} ${State.Name} ${PrivateIpAddress}`;
  }).sort();


  // allow the choice to quit
  choices.push(QUIT);

  return createMenu(choices, 'Select the instance you want to ssh into:');
}

function createMenu(choices, message) {
  return inquirer.prompt({
    type: 'list',
    name: 'answer',
    message,
    choices
  });
}

function createActionsMenu(instanceSelection) {
  return createMenu([SSH, INFO, BACK], `Choose action for ${instanceSelection}:`);
}

async function getInstances() {
  let options = {};

  if (name !== '_') { 
    options.Filters = [{
      Name: 'tag:Name',
      Values: [ name ]
    }];
  }

  let foundInstances = [];
  (await ec2.describeInstances(options).promise()).Reservations.forEach(({Instances}) => {
    Instances.forEach(instance => foundInstances.push(instance));
  });

  return foundInstances;
}

async function selectInstanceAction(instanceInfo) {
    let ipAddress = instanceInfo.PublicIpAddress || instanceInfo.PrivateIpAddress

    let { answer: action } = await createActionsMenu(instanceInfo);

    if (action === SSH) {
      await writeToFile(`ssh -vv ${ipAddress}`);
      // everything good, exit with code 0 (all good)
      process.exit(0);
    } else if (action === BACK) {
      await selectInstance();
    } else if (action === INFO) {
      console.log(YML.safeDump(instanceInfo));
      await selectInstanceAction(instanceInfo);
    }
}

async function selectInstance() {
  try {
    const foundInstances = await getInstances();

    if (!foundInstances.length) {
      console.log('No instances found');
      process.exit(3);
    }

    let { answer: instanceSelection } = await createInstanceMenu(foundInstances);

    if (instanceSelection === QUIT) {
      // exit with exit code 2 (user quit)
      return process.exit(2);
    }

    let selectedInstanceId = instanceSelection.split(' ')[0];
    let selectedInstanceInfo = foundInstances.find(({InstanceId}) => InstanceId === selectedInstanceId);

    await selectInstanceAction(selectedInstanceInfo);
  } catch (err) {
    console.error(err)
    // return with exit code 1 (error)
    process.exit(1);
  }
}

selectInstance();
