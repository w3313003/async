const slice = Array.prototype.slice;
function isObject(val) {
    return Object === val.constructor;
};
function isPromise(obj) {
    return 'function' === typeof obj.then;
}

function isGenertor(obj) {
    return typeof obj.next === "function" && typeof obj.return === "function" && typeof obj.throw === "function";
}

function isGenertorFunction(fn) {
    try {
        const constructor = fn.constructor;
        if (!constructor) {
            return false;
        }
        if (constructor.name === "GeneratorFunction") {
            return true;
        }
        return isGenertor(constructor.prototype);
    } catch (e) {
        return false;
    }
}

/**
 * @param {*} thunk -> 将参数与回调函数分离 fn(p1, p2, cb) -> thunk(p1, p2)(cb)
 */
function thunkToPromise(thunk) {
    const ctx = this;
    return new Promise((resolve, reject) => {
        thunk.call(ctx, (err, res) => {
            if (err) return reject(err);
            if (arguments.length > 2) {
                res = slice.call(arguments, 1);
            }
            resolve(res);
        })
    })
}

function objectToPromise(obj) {
    const results = new obj.constructor();
    const keys = Reflect.ownKeys(obj);
    const promises = [];
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const promise = toPromise.call(this, obj[key]);
        if(promise && isPromise(promise)) {
            defer(promise, key)
        } else {
            results[key] = obj[key]
        }
    }
    return Promise.all(promises).then(() => results);
    function defer(promise, key) {
        results[key] = undefined;
        promises.push(promise.then(res => {
            results[key] = res;
        }))
    }
}
const obj = {
    name: 123,
    age: 0,
    test: {
        name: 123
    }
};
objectToPromise(obj).then(res => {

})
function arrayToPromise(arr) {
    return Promise.all(arr.map(toPromise, this))
}

function toPromise(obj) {
    if(!obj) return obj;
    if(isPromise(obj)) return obj;
    if(isGenertor(obj) || isGenertorFunction(obj)) return co.call(this, obj);
    if(typeof obj === "function") return thunkToPromise.call(this, obj);
    if(Array.isArray(obj)) return arrayToPromise.call(this, obj);
    if(isObject(obj)) return objectToPromise.call(this, obj);
    return obj;
}

function co(gen) {
    const ctx = this;
    const args = slice.call(arguments, 1);
    let it;
    return new Promise((resolve, reject) => {
        if(typeof gen === "function") {
            it =  gen.apply(ctx, args);
        }
        if(!it || !isGenertor(it)) {
            return resolve(it)
        }
        onFulfilled();
        function onFulfilled(res) {
            let ret;
            try {
                ret = it.next(res)
            } catch(e) {
                return reject(e)
            }
            next(ret)
        }
        function onRejected(err) {
            let ret;
            try {
                ret = it.throw(err)
            } catch (e) {
                return reject(e)
            }
            next(ret)
        }
        function next(ret) {
            if(ret.done) return resolve(ret.value);
            const value = toPromise.call(ctx, ret.value);
            if(value && isPromise(value)) {
                return value.then(onFulfilled, onRejected)
            }
            return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' +
                'but the following object was passed: "' + String(ret.value) + '"'));
        }
    })
}
co.wrap = function (fn) {
    createPromise.__generatorFunction__ = fn;
    return createPromise;

    function createPromise() {
        return co.call(this, fn.apply(this, arguments));
    }
};
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
    return 666;
}
co(generator).then(res => {
    console.log(res)
});