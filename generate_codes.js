// generate_codes.js
const fs = require('fs');

function randSegment(n=4){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for(let i=0;i<n;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
function genCode(prefix='QP52', segs=[4,4]){
  return prefix + '-' + segs.map(s=>randSegment(s)).join('-');
}

function main(out='codes.json', total=100, paidRatio=0.3){
  const codes = [];
  const paidCount = Math.floor(total * paidRatio);
  for(let i=0;i<total;i++){
    const code = genCode();
    codes.push({
      code,
      type: i < paidCount ? 'paid' : 'free',
      notes: '',
      expires: null,
      used: false
    });
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    count: codes.length,
    codes
  };
  fs.writeFileSync(out, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${codes.length} codes to ${out}`);
}

const args = process.argv.slice(2);
const total = Number(args[0] || 100);
const paidRatio = Number(args[1] || 0.3);
main('codes.json', total, paidRatio);
