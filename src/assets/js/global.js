function toBoolean(obj) {
    return obj instanceof Boolean ? obj.valueOf() : obj
}

Object.prototype.let = function (callback) {
    return callback.apply(this, [toBoolean(this)])
}

Object.prototype.applyy = function (callback) {
    callback.apply(this, [toBoolean(this)])
    return this
}