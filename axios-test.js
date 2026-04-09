const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:4000/api/v1' });
console.log("With leading slash:", api.getUri({ url: '/auth/login' }));
console.log("Without leading slash:", api.getUri({ url: 'auth/login' }));
