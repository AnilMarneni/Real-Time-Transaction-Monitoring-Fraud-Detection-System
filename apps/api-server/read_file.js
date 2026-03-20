const fs = require('fs');
try {
  const content = fs.readFileSync('test-out.txt', 'utf16le');
  console.log(content);
} catch (e) {
  try {
    const content2 = fs.readFileSync('test-out.txt', 'utf8');
    console.log(content2);
  } catch (e2) {
    console.error(e2);
  }
}
