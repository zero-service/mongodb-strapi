/**
 * Created by tenvine Date: 2019/12/31 Time: 6:24 下午
 */

var process = require('child_process');

process.exec('echo "/v2/tune/refresh" |openssl dgst -binary -hmac "Qc2zFVu4tk3RNRbTEC8Jm8iGyBCXthRvqn-7zoB_" -sha1 |base64 | tr + - | tr / _', function (error, stdout, stderr) {
  if (error !== null) {
    console.log('exec error: ' + error);
  }
  console.log(`stdout: ${stdout}`);
  if (stdout) {
    console.log(`stdout: ${stdout}`);
    const shell = `curl -X POST -H "Authorization: QBox jDDs0yej7KG_HTqAoTbkI-U9v4b_GjKORYwZV_mt:${stdout.trim()}" http://fusion.qiniuapi.com/v2/tune/refresh -d '{"urls":["http://wolf.article.yihaozfl.cn/rn/shitawudev2/config.json"]}' -H 'Content-Type: application/json'`;
    console.log(shell);
    setTimeout(() => {
      process.exec(shell, function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        console.log(`stdout: ${stdout}`);
      });
    }, 1000);
  }
});
