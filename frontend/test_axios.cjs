const axios = require('axios');
const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => {
  if (config.data === 'formdata') {
    delete config.headers['Content-Type'];
  }
  return config;
});
api.post('http://localhost:12345', 'formdata').catch(e => {
  console.log('Headers:', e.config.headers);
});
