'use strict';

let fs = require('fs');
let https = require('https');
let execFrequent = require('exec-frequent');
let count = 1;
let myStars = {
    count: 0,
    stars: []
};

const URL = 'https://github.com/stars/iamcco?direction=desc&page={page}&sort=stars';

function parse(html, cb) {
    let regName, match;
    regName = /<h3[^>]*?>\s*<a href="\/(.*?)">.*?(<p class\=\"repo-list-description\">\s*(.*?)\s*<\/p>)?\s*<p class=\"repo-list-meta\">\s*(.*?)\s*<\/p>/g;
    while((match = regName.exec(html)) !== null) {
        myStars.stars.push({
            name: match[1],
            desc: match[3] || '',
            stars: match[4]
        });
        myStars.count ++;
    }

    cb();
}

function getPage(cb) {
    console.log(count);
    https.get(URL.replace(/\{page\}/, count++), function(res) {
        if(res.statusCode === 200) {
            let data = '';
            res.setEncoding('utf-8');
            res.on('data', function(thunk) {
                data += thunk;
            });
            res.on('end', function() {
                parse(data.split('\n').join(''), cb);
            });
        } else if( res.statusCode === 404) {
            console.log('Have no more data');
        } else {
            throw new Error('Status Code: ' + res.statusCode);
            process.exit();
        }
    }).on('error', function(err) {
        console.log(err.message);
    });
}

execFrequent(getPage, function() {
    fs.writeFileSync('./mystars.json', JSON.stringify(myStars));
}, 30, 3, true);

