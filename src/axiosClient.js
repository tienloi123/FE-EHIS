import axios from 'axios';

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/`,
  headers: {
    'content-type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('access_token')

    config.headers = {
      ...config.headers,
      authorization: `Bearer ${token ? token : ''}`,
    };
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  },
);

export default axiosClient;