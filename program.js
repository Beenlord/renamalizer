const path = require('path');
const fs = require('fs');
const { slugify } = require('transliteration');


const rollbackDir = path.join(path.dirname(process.argv[0]), '.rollback');

const args = [...process.argv];
delete args[0];
delete args[1];

const prom = [];

let rollbackFile = [];

if (fs.existsSync(rollbackDir)) {
    rollbackFile = JSON.parse(fs.readFileSync(rollbackDir));
}

args.forEach(arg => {
    if (path.extname(arg)) {
            const name = path.basename(arg);
            const slug = slugify(name);

            toReturn = false;
            rollbackFile.forEach(rollback => {
                if (name === rollback.newName) {
                    rename(arg, prom, name, rollback.oldName, true);
                    rollback.delete = true;
                    toReturn = true;
                }
            })
            if (toReturn === false) {
                rename(arg, prom, name, slug);
            }
        };
});

Promise.all(prom)
    .then(resolves => {
        results = resolves.concat(rollbackFile);
        results = results.filter(result => {
            return result.delete === false;
        })

        fs.writeFileSync(
            rollbackDir,
            JSON.stringify(results),
            {encoding: "UTF-8"}
        );
    });

function rename(arg, promiseArr, curName, newName, del) {
    promiseArr.push(new Promise((resolve, reject) => {
        fs.rename(arg, arg.replace(curName, newName), err => {
            if (!err) {
                resolve({
                    oldName: curName,
                    newName: newName,
                    pathFile: arg,
                    delete: del ?? false,
                });
            } else {
                reject(err);
            }
        });
    }))
}
