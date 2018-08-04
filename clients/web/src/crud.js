const onSuccess = f => res => {
  switch (res.status) {
  case 401: throw new Error('You are not authenticated, please log in');
  case 403: throw new Error('You are not authorized to access this information');
  case 200: return f(res);
  default: 
    console.error(`['${res.url}'] unexpected response (${res.status})`);
    throw new Error(`Sorry, we're having technical difficulties at the moment`);
  }
};

// Returns the JSON body of the response if successful, and an object
// response with at least the field { error: `String message...` },
// otherwise.
export async function getJSON(path) {
  return fetch(path, {
    method: 'GET',
    credentials: 'same-origin'
  }).then(onSuccess(async res => {
    const json = await res.json();
    console.log(`getJSON(${path}) => `, json);
    return json;
  }));
}

export async function putJSON(path, payload) {
  return fetch(path, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(onSuccess(res => res.json()));
}

export async function postJSON(path, payload) {
  return fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(onSuccess(res => res.json()));
}
