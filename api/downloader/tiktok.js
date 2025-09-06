const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://tiktok-download-without-watermark.p.rapidapi.com/vid/index',
  params: {
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173'
  },
  headers: {
    'X-RapidAPI-Key': '18bf936bddmshf0a0a1bba86fe69p18dff8jsn2b671c3f9e9b', 
    'X-RapidAPI-Host': 'tiktok-download-without-watermark.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
  console.log("✅ Data berhasil diambil:");
  console.log(response.data);
}).catch(function (error) {
  console.error("❌ Terjadi error:");
  console.error(error);
});
