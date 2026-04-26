const XLSX = require('xlsx');
const fs = require('fs');

const fullPath = 'C:/Users/30390/Desktop/安法学院第九届团委学生会信息收集.xlsx';
const wb = XLSX.readFile(fullPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, {header:1});

const headers = data[0];
console.log('Headers:', headers.join(','));

for(let i = 1; i < data.length; i++) {
    const row = data[i];
    console.log(`Row${i}: ${row.join('|')}`);
}
