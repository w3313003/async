const path = require("path");
const fs = require("fs");
const readFile = function(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf-8" ,(err, data) => {
            if(err) {
                return reject(err);
            };
            resolve(data);
        })
    })
}

function* generator() {
    const file1 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file1)
    const file2 = yield readFile(path.join(__dirname, '2.txt'));
    console.log(file2)
    const file3 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file3)
    const file4 = yield readFile(path.join(__dirname, '2.txt'));
    console.log(file4)
    const file5 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file5)
};
const iter = generator();
function runGen(gen) {
    const iter = gen();
    function next(data) {
        const result = iter.next(data);
        if(result.done) {
            return result.value;
        };
        result.value.then(res => {
            next(res);
        })
    };
    next();
};
runGen(generator)