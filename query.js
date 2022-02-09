/*
 * Simplified http client
 * Supports callback and promises
 * Automatically detects payload type and sets 'Content-Type' header
 *  type 'Uint8Array': sent as binary (application/octet-stream)
 *  type 'object': sent as json (application/json)
 * Options
 *  dataType, expected response from server 'binary'
 *  headers, dictionnary of headers for the request
 *  noException, flag to never throw errors or exceptions
 * Response
 *  headers, dictionnary of response headers
 *  status, status
 *  json(), json converter
 *  text, text formatted response
 *  raw, binary response
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