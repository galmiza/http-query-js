# Introduction

The simple script defines the function **query** that can be used to perform http requests to a server.  
It is build directly on the native XMLHttpRequest and supports promises and callbacks, text, json and binary payload in requests and responses.

**Notes**: While this script is perfectly suitable for **production environments** and ideal for **teaching purposes**, you can use the more advanced [axios](https://github.com/axios/axios) to have a better control over the http requests.

# Features

* Supports callbacks and promises
* Automatically sets headers from request payload type
* Exposes converters .text() and .json() in responses
* Supports Uint8Array binary format
* Allows disabling exceptions

# Usage

Include a script tag in your html file to import the query function.  
You can also take advantage of semantic versioning by adding @{version-number} to the repository name. You can target major, minor, and patch releases as desired.

```html
<!-- Always get the latest version -->
<!-- Not recommended for production sites! -->
<script src="https://cdn.jsdelivr.net/gh/galmiza/http-query-js/query.js"></script>

<!-- Get a specific version -->
<script src="https://cdn.jsdelivr.net/gh/galmiza/http-query-js@1.0.0/query.js"></script>
```

With **callback**

```javascript
// query(method,url,payload,callback[,options])
query('post', '/api/foo', { a:0, b:[] }, function(res,err) {
  if (err) console.error(`caught an error! ${err}`);
  else console.error(`get the response ${res}`);
})
```

With **promise** using **await**

```javascript
try {
  // query(method,url,payload[,options])
  const res = await query('post', '/api/foo', { a:0, b:[] });
  console.error(`get the response ${res}`);
} catch(err) {
  console.error(`caught an error! ${err}`);
}
```

With **promise** using **then/catch**

```javascript
// query(method,url,payload[,options])
query('post', '/api/foo', { a:0, b:[] })
.then(res => console.error(`get the response ${res}`))
.catch(err => console.error(`caught an error! ${err}`));
```

# Options

* **dataType**, set to *binary* if you expect an *ArrayBuffer* response
* **headers**, dictionnary of headers for the request
* **noException**, boolean flag to disable exceptions when status code is lower than 400

# Response

When no exception is thrown, the response is a dictionnary containing:

* **headers**, a dictionnary of the response headers
* **status**, the status code of the response
* **json**, a function to convert the response payload in json
* **text**, a function to convert the response payload in text
* **raw**, the raw response (an ArrayBuffer if option *dataType* is set to *binary*)
