const axios = require('axios');
const FormData = require('form-data');
const form = new FormData();
form.append('test', '123');

const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});
api.post('http://localhost:12345', form).catch(e => {
  console.log('Headers:', e.config.headers);
});
