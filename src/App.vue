<script setup>
const formData = new FormData();
formData.append('username', 'example_user');
formData.append('text', new File(['this is avatar'], 'foo.txt', { type: 'text/plain' }));

const data = JSON.stringify({ username: 'example_user', text: 'this is avatar' });
const querystring = '?date=2000-01-01&version=1.0.0';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const apis = ['/api/test', '/api/test/1', '/api/test/1/foo'];

const requestOptions = [];
apis.forEach(api => {
  methods.forEach(method => {
    requestOptions.push([
      { url: api, method },
      { url: api + querystring, method },
    ]);

    if (method === 'GET') {
      // Request with GET/HEAD method cannot have body.
      return;
    }

    requestOptions.push([
      { url: api, method, headers: { 'Content-Type': 'application/json' }, body: data },
      { url: api + querystring, method, headers: { 'Content-Type': 'application/json' }, body: data },
    ]);

    requestOptions.push([
      { url: api, method, body: formData },
      { url: api + querystring, method, body: formData },
    ]);
  });
});

async function processRes(res, method, body) {
  const resData = await res.json();
  console.log(method + ': ', res.url);
  if (body) {
    console.log('body: ', body);
  }
  console.log('res: ', resData);
  return resData;
}

let promise = Promise.resolve();

// requestOptions.forEach(([options, optionsWithQueryString]) => {
//   promise = promise.then(() =>
//     Promise.allSettled([
//       fetch(options.url, options).then(res => processRes(res, options.method, options.body)),
//       fetch(optionsWithQueryString.url, optionsWithQueryString).then(res =>
//         processRes(res, optionsWithQueryString.method, optionsWithQueryString.body)
//       ),
//     ])
//   );
// });

fetch('/api/file/7385471705264819456')
  .then(res => res.json())
  .then(res => console.log(res));

fetch('/api/likes?size=800')
  .then(res => res.json())
  .then(res => console.log(res));

fetch('/api/read-write-test');
</script>

<template>
  <div>douzhencang-local-pro</div>
</template>
