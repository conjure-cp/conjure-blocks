console.log("hello");
import file from './essenceBNF.txt';
console.log(typeof(file))
let lines = file.split("\r\n");

let comment = /^!/;
let usable = [];
for (let s of lines){
    if (! (comment.test(s)) & (s != '')) {
        usable.push(s);
    }
}

console.log(usable);
let def = /\w+(?= :=)/;

for (let b of usable){
    let name = def.exec(b);
    console.log(name[0]);
    let definition = b.slice(b.indexOf("=") + 1)
    console.log(definition);
    let quoted = /\"[\w\:\s]*\"/g;
    let matches = definition.matchAll(quoted);
    let replaced = definition.replaceAll(quoted, "#");
    let argsTypes = definition.matchAll(/\w+/g); 
    let argsReplaced = replaced.replace(/\w+/g, "%1");
    console.log(matches);
    console.log(replaced);
    console.log(argsReplaced);
    console.log(argsTypes);
}