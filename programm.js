import path from 'path';
import fs from 'fs';
import { slugify } from 'transliteration';

const rollbackFile = './rollback.json';

const args = [...process.argv];
delete args[0];
delete args[1];

const prom = [];

args.forEach((arg) => {
    if (path.extname(arg)) {

        prom.push(new Promise((resolve, reject) => {
            const name = path.basename(arg);
            const slug = slugify(name);

            fs.rename(arg, arg.replace(name, slug), (err) => {
                if (!err) {
                    resolve({
                        oldName: name,
                        newName: slug,
                        pathFile: arg,
                    });
                    return;
                }
                reject(err);
            });
        }));
    }
});

Promise.all(prom)
    .then((results) => {
        fs.writeFileSync(
            rollbackFile,
            JSON.stringify(results),
            { encoding: "utf-8" }
        );
    });
