const axios = require('axios');
const api = axios.create({ baseURL: 'api/v1' });
console.log("With leading slash:", api.getUri({ url: '/auth/login' }));
console.log("Without leading slash:", api.getUri({ url: 'api/auth/login' }));
console.log("What causes the double api/v1/api?:", api.getUri({ url: '/api/auth/login' }));
