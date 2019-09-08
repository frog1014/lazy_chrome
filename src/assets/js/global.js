Object.prototype.let = function (callback) {
    return callback.apply(this, [this])
}