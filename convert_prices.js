const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/shiva/Downloads/web dev';
const files = ['index3.html', 'men.html', 'women.html', 'kids.html', 'elder.html', 'accessories.html'];

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace ₹12,345 style prices — divide by 5 and round to nearest 10
    content = content.replace(/₹([\d,]+)/g, (match, amountStr) => {
        const amount = parseInt(amountStr.replace(/,/g, ''));
        const newAmount = Math.round((amount / 5) / 10) * 10;
        return '₹' + newAmount.toLocaleString('en-IN');
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + file);
});

console.log('All prices reduced!');
