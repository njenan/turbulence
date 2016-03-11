module.exports = function (candidate) {
    return /.*\.js/g.exec(candidate) === null;
};
