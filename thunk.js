const path = require("path");
const fs = require("fs");
const { slice } = Array.prototype;

const Thunkify = function(fn) {
    return function() {
        const args = Reflect.apply(slice, arguments, []);
        const ctx = this;
        return function(callback) {
            let called;
            if(!called) {
                args.push(function() {
                    called = true;
                    callback.apply(null, arguments);
                })
            };
            try {
                fn.apply(ctx, args);
            } catch(e) {
                callback(e);
            }
        }
    }
};
const readFileThunk = Thunkify(fs.readFile);
const gen = function* () {
    let r1 = yield readFileThunk(path.join(__dirname, "1.txt"), "utf-8");
    console.log(r1);
    let r2 = yield readFileThunk(path.join(__dirname, "2.txt"), "utf-8");
    console.log(r2);
};
// 手动调用 next只能接收data作为唯一参数
// const iter = gen();
// iter.next().value((err, data) => {
//     if(err) return err;
//     iter.next(data).value((err, data) => {
//         iter.next(data)
//     })
// })
function runGen(gen) {
    const iter = gen();
    function next(err, data) {
        if(err) {
            return;
        }
        const result = iter.next(data);
        if(result.done) {
            return result.value;
        };
        result.value((err, data) => {
            next(err, data);
        });
    };
    next();
};
runGen(gen)