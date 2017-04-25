# ec2-ssh-cli

A simple cli tool for quickly accessing ec2 instances in your AWS environment.

<p align='center'>
  <img src='assets/ssh.gif?raw=true' height='500px'/>
</p>

### Installation

```bash
npm install -g ec2-ssh-cli
```

### Usage

Using the tool is easy. To display instances by their exact name, simply pass the name as an argument.

```bash
ec2-ssh-cli my-dev-box
```

You can also use an asterisk (`*`) to perform wildcard matches.

Here are a few examples of what you can do:

```bash
# return instances with names that start with 'my-'
ec2-ssh my-*

# return instances with names that end with 'box'
ec2-ssh *box

# return instances with names that contain 'dev'
ec2-ssh *dev*

# return instances with names that start with 'my' and end with 'box'
ec2-ssh my*box
```

Selecting an instance will create another menu showing you the options `Info`, `ssh` or `Back`

Selecting `Info` will display information about the instance in yml format, `ssh` will connect you to the instance so that you can do whatever you need, and selecting `Back` will return to the list of instances.
