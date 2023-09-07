import fs from 'fs';

function create_file_txt() {
    fs.writeFile('date_current.txt', new Date().toLocaleString('es-MX'), err => {
        if (err) throw err;
    })
}

create_file_txt();