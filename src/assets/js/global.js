Object.prototype.let = function (callback) {
    return callback.apply(this, [this])
}

Object.prototype.applyy = function (callback) {
    callback.apply(this, [this])
    return this
}