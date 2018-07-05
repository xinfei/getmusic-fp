import axios from 'axios';
var qs=require('qs');

// 酷狗
let kuGouUrl = 'http://songsearch.kugou.com/song_search_v2?callback=jQuery191034642999175022426_1489023388639&keyword={歌曲名称}&page=1&pagesize=1000&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0&_=1489023388641';
// let baseUrl = 'http://localhost:8083'
// let baseUrldown = 'http://localhost:8083'
// 搬瓦工
let baseUrldown = 'http://23.105.200.233:8083'
// 阿里云
let baseUrl = 'http://47.104.175.209:8083'

export default {
  base: function(){
    return baseUrldown
  }
}

// axios.interceptors.request.use((config) => {
//   if (sessionStorage.getItem('user')) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
//     let user = JSON.parse(sessionStorage.getItem('user'));
//     config.headers.Authorization =  'JWT '+user.access_token;
//   }
//   return config;
// }, (err) => {
//   return Promise.reject(err);
// });

// 酷狗
// 根据关键词获取歌曲列表
export const getKuGouMusicList = params => { return axios.post(`${baseUrl}/kugou/list`, qs.stringify(params));};

// 根据歌曲hash值获取歌曲地址
export const getKuGouMusicUrl = params => { return axios.post(`${baseUrl}/kugou/music`, qs.stringify(params));};

// 根据歌曲不同音质hash值获取歌曲不同音质的播放地址
export const getKuGouMusicQualityUrl = params => { return axios.get(`${baseUrl}/kugou/music`, {params: params});};

