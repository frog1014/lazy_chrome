function getPrimitiveVal(obj) {
    if (
        obj instanceof Boolean ||
        obj instanceof Number ||
        obj instanceof String
    )
        return obj.valueOf()
    else
        return obj
}

Object.prototype.let = function (callback) {
    return callback.apply(this, [getPrimitiveVal(this)])
}

Object.prototype.applyy = function (callback) {
    callback.apply(this, [getPrimitiveVal(this)])
    return this
}