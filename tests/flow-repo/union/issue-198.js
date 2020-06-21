var p = new Promise(function(resolve, reject) {
    resolve(5);
})
    .then(function(num) {
        return num.toFixed();
    })
    .then(function(str) {
        // This should fail because str is string, not number
        return str.toFixed();
    });
