import crypto from 'crypto';

const signString = "phone=17866703622#time=1760176716520#secret_key=1fp}fdSpYaj>7P;5b|HmTBF;OQmC"
const sign = crypto.createHash('md5').update(signString).digest('hex');

console.log(sign)
