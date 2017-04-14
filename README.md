# ec2-ssh-cli

A tool for easily sshing into any of your ec2 instances.

# Installation

```bash
npm i -g ec2-ssh-cli
```

# Usage

To ssh into an instance, simply pass the name of the instance that you want to ssh into.

```bash
ec2-ssh-cli <instance name>
```
![ec2-ssh](https://media.giphy.com/media/xUA7bk1fYw9k5iNN7i/giphy.gif)

You can search by prefix by adding an asterisk at the end of your input.

```bash
ec2-ssh-cli <prefix>*
```

![ec2-ssh-wildcard](https://media.giphy.com/media/3ohzdD9GyG2zNFu8zC/giphy.gif)
