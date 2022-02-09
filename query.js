/*
 * Simplified http client
 *  Supports callbacks and promises
 *  Automatically sets headers from request payload type
 *  Exposes converters .text() and .json() in responses
 *  Supports Uint8Array binary format
 *  Allows disabling exceptions
 * Options
 *  dataType, set to binary if you expect an ArrayBuffer response
 *  headers, dictionnary of headers for the request
 *  noException, boolean flag to disable exceptions when status code is lower than 400
 * Response
 *  headers, a dictionnary of the response headers
 *  status, the status code of the response
 *  json, a function to convert the response payload in json
 *  text, a function to convert the response payload in text
 *  raw, the raw response
 */
const query = (method,url,body,callback,options) => {

  // Wrap response
  const wrap_response = (xhr) => {
    const headers = {};
    xhr.getAllResponseHeaders().split('\n').map(l => {
      const [k,v] = l.split(': ');
      if (v) headers[k.toLowerCase()] = v;
    });
    return {
      headers: headers,
      status: xhr.status,
      json: () => JSON.parse(xhr.response),
      text: () => xhr.responseText,
      raw: xhr.response
    }
  }

  // Define the promise version
  const query_promise = (method,url,body,options) => new Promise(async (resolve,reject) => {
    if (!options) options = {};
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    if (options.headers) {
      for (let k in options.headers) {
        xhr.setRequestHeader(k, options.headers[k]);
      }
    }
    if (options.dataType=='binary') {
      xhr.responseType = 'arraybuffer';
    }
    if (body instanceof Uint8Array) {
      body = body.buffer;
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    }
    if (typeof(body)=='object' && !(body instanceof ArrayBuffer)) {
      body = JSON.stringify(body);
      xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status < 400 || options.noException) {
          resolve(wrap_response(xhr));
        } else {
          reject(wrap_response(xhr));
        }
      }
    }
    xhr.send(body);
  });

  // Detect if user expects a promise or a callback
  if (typeof(callback)!='function') { // no callback provided, promise expected!
    options = callback; // shift parameter definition
    return query_promise(method,url,body,options);
  } else { // callback provided!
    try {
      (async () => callback(null,await query_promise(method,url,body,options)))(); // anonymous async function
    } catch(e) {
      callback(e);
    }
  }
}