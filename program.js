import path from 'path';
import fs from 'fs';
import { slugify } from 'transliteration';


const rollbackDir = './rollback.json';

const args = [...process.argv];
delete args[0];
delete args[1];

const prom = [];

const rollbackFile = JSON.parse(fs.readFileSync(rollbackDir));

args.forEach((arg) => {
    if (path.extname(arg)) {
        prom.push(new Promise((resolve, reject) => {
            const name = path.basename(arg);
            const slug = slugify(name);

            rollbackFile.forEach((rollback, i) => {
                if (name === rollback.newName) {
                    try {
                        resolve(rename(arg, name, rollback.oldName, true));
                    }
                    catch(err) {
                        reject(err)
                    }
                }
            })

            resolve(rename(arg, name, slug));
        }));
    }
});

Promise.all(prom)
    .then((results) => {
        console.log(results);
        results = results.filter(result => {
            console.log('result ->', result);
            result.delete === false;
        })
        results.push(rollbackFile);

        fs.writeFileSync(
            rollbackDir,
            JSON.stringify(results),
            { encoding: "UTF-8"}
        );
    });

function rename(arg, curName, newName, del) {
    fs.rename(arg, arg.replace(curName, newName), err => {
        if (!err) {
            return({
                oldName: curName,
                newName: newName,
                pathFile: arg,
                delete: del ?? false,
            });
        } else {
            throw(err);
        }
    });
}
