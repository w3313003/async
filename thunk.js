const path = require("path");
const fs = require("fs");

const { slice } = Array.prototype;

/**
 * 
 * @param {*} fn 
 */
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
    let r1 = yield readFileThunk(path.join(__dirname, "1.txt"));
    console.log(r1.toString());
    let r2 = yield readFileThunk(path.join(__dirname, "2.txt"));
    console.log(r2.toString());
};

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