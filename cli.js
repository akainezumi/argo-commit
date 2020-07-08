#!/usr/bin/env node

const {commit,confirm,choice} = require('./index');
const { exec } = require('child_process');
const {argv} = require('yargs');
const clipboardy = require('clipboardy');



// console.log(argv);

var message = process.argv[2];
if(message === undefined){
    console.log("ERROR: commit message empty");
    return;
}

exec("git rev-parse --is-inside-work-tree 2>/dev/null", (error, stdout, stderr)=>{
    if(error){
        console.log("ERROR: not a git repository")
        return;
    }
    if(stderr){
        console.log(`stderr: ${stderr}`);  
        return;
    }
    exec("git symbolic-ref --short HEAD | tr '\n' ' '", (error, stdout, stderr) => {
        if(error){
            console.log(error);
            
            return error;
        }
        if(stderr){
            console.log(stderr)
            return stderr;
        }
        choice().then(action => {
            commit().then(type => {
                var branchName = stdout;
                var commitMessage = `[${type}] ${branchName}- ${message}`
                console.log(`%cmessage : %c"${commitMessage}"`,"font-weight:bold","font-weight:regular")
                confirm().then(response => {
                    if(response == true){
                        // var copy = Boolean(argv.c)
                        var copy = action == "copy";
                        var command = copy ? commitMessage : `git commit -m "${commitMessage}"`;
                        if(copy === true){
                            clipboardy.writeSync(command)
                            console.log(`Commit message has been copied to clipboard.`)
                        } else {

                            exec (command, (error,stdout,stderr) => {
                                if(stdout){
                                    console.log(stdout);
                                    return;
                                }
                            })
                        }
                    }
                });
            });
        })

    })
})



