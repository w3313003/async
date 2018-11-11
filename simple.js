const fs = require("fs");
const path = require('path');
const readFile = function (filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (!err) {
                resolve(data);
            } else {
                reject(err)
            }
        })
    })
};
function* generator() {
    const file1 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file1);
    const file2 = yield readFile(path.join(__dirname, '2.txt'));
    console.log(file2);
    const file3 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file3);
    const file4 = yield readFile(path.join(__dirname, '2.txt'));
    console.log(file4);
    const file5 = yield readFile(path.join(__dirname, '1.txt'));
    console.log(file5);
};
function run(gen) {
    const it = gen();
    function next(data) {
        const result = it.next(data);
        if (result.done) {
            return result.value
        }
        result.value.then(data => {
            next(data);
        })
    };
    next();
};
run(generator)
// 手动执行
// const iter = generator();
// iter.next().value.then(res => {
//     iter.next(res).value.then(res => {
//         iter.next(res);
//     });
// });

function thunk(fn) {
    return function() {
        const args = Array.prototype.slice.call(arguments);
        const ctx = this;
        return function(cb) {
            let called = false;
            args.push(function() {
                if(called) return;
                called = true;
                cb.apply(ctx, arguments)
            });
            return fn.apply(ctx, args);
        }
    }
} 


const Thunk = function (fn) {
    return function () {
        const args = Reflect.apply(Array.prototype.slice, arguments, []);
        return function (cb) {
            var called;
            args.push(function() {
                if(called) return;
                called = true;
                cb.apply(this, arguments)
            })
            return fn.apply(this, args);
        }
    }
}
function test(name, age, callback) {
    callback(name, age);
};
const testThunk = Thunk(test);
testThunk(1,2)((a, b) => console.log(a, b))
var obj = {
    a: [1, 2, 3]
};
var c = obj.a;
const v = {};
v.c = c;
console.log(obj.a === v.c)