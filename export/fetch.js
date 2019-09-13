const co = require('co');
const fs = require('fs');

const DB = require('../db');
const Conf = require('../conf');
const Comm = require('../comm');

const dlDir = Conf.exp.dlDir;
const rows = 500;
const pageFile = 'fetch.page';
const outFile = 'fetch.txt';

co(function*() {
    yield DB.init();
    const page = Comm.readFileInt(pageFile, 1);
    const exFiles = Comm.mp4Files(dlDir);
    let sql = `SELECT id, mp4 FROM videos WHERE saved=0`;
    if (exFiles.length > 0) {
        sql += ` AND mp4 NOT LIKE '%${exFiles.join(`' AND \`mp4\` NOT LIKE '%`)}'`;
    }
    sql += ` ORDER BY id LIMIT ${(page - 1) * rows}, ${rows}`;
    let pms = [];
    const data = yield DB.query(sql, pms);
    console.log(`Fetch page ${page} count ${data.length}`);
    if (data.length > 0) {
        Comm.writeFileVal(pageFile, page + 1);
        for (let i = 0; i < data.length; i++) {
            fs.appendFileSync(outFile, `${data[i].mp4}?id=${data[i].id}\r\n`);
        }
    }
    console.log(`Complete.`)
}).catch((err) => {
    console.error(err);
});
