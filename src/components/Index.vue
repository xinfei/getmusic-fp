<template>
  <el-container>
    <el-header>
      <div class="wl">
        <!--<div class="logo"><img src="../../static/img/logo.jpg" alt=""></div>-->
        <div class="title">技术改变生活</div>
      </div>
    </el-header>
    <el-main>
      <!--搜索框-->
      <div class="search-b wl">
        <div class="user-in">
          <el-input placeholder="请输入歌曲名称" v-model="musicName" class="input-with-select" @keydown.native="enterSearch($event)">
            <!--<el-select v-model="select" slot="prepend" placeholder="请选择">-->
            <!--<el-option label="餐厅名" value="1"></el-option>-->
            <!--<el-option label="订单号" value="2"></el-option>-->
            <!--<el-option label="用户电话" value="3"></el-option>-->
            <!--</el-select>-->
            <el-button slot="append" icon="el-icon-search" @click="getMusicList"></el-button>
          </el-input>
        </div>
        <div class="img-b"><img src="../../static/img/img01.png" alt=""></div>
      </div>
      <!--播放器-->
      <el-row :gutter="20" style="padding:20px 0;">
        <el-col :span="8" :offset="8" style="min-height:100px;">
          <aplayer autoplay :music="musicPlayer" v-if='isShow' :showlrc="true"></aplayer>
        </el-col>
      </el-row>
      <!--歌曲列表-->
      <el-table class="result-table" :key="tableKey" :data="propertyData" v-loading.body="listLoading" border fit >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column align="center" label="歌曲名">
          <template slot-scope="scope">
            <span>{{scope.row.songname}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="专辑名">
          <template slot-scope="scope">
            <span>{{scope.row.album_name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="歌手名">
          <template slot-scope="scope">
            <span>{{scope.row.singername}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="300px" label="操作">
          <template slot-scope="scope">
            <el-button size="small" type="primary" @click="playMusic(scope.row)">歌曲试听</el-button>
            <el-button size="small" type="primary" @click="downLrc(scope.row)">歌词下载</el-button>
            <el-button size="small" type="success" @click="downMusic(scope.row)">歌曲下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div v-show="!listLoading" class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                       :current-page.sync="listPara.page" :page-sizes="[10,20,30,50]" :page-size="listPara.size"
                       layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
      </div>
    </el-main>
    <!--下载选择音质-->
    <el-dialog title="选择音质" :visible.sync="qualityVisible" :close-on-click-modal="false">
      <el-button size="small" type="primary" v-if="btnNQ" @click="getMusicFile('nq')">NQ</el-button>
      <el-button size="small" type="primary" v-if="btnHQ" @click="getMusicFile('hq')">HQ</el-button>
      <el-button size="small" type="primary" v-if="btnSQ" @click="getMusicFile('sq')">SQ</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="qualityVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import {getKuGouMusicList, getKuGouMusicUrl, getKuGouMusicQualityUrl} from "../api/ajax"
  import base from "../api/ajax"
  import Aplayer from 'vue-aplayer'
  export default {
    components: {
      // 引入组件
      Aplayer
    },
    data () {
      return {
        // 播放器
        musicPlayer: {
          title: '请选择音乐',
          author: '请选择音乐',
          url: '',
          pic: '',
          lrc: ''
        },
        isShow: false,
        musicName: '',
        listPara: {
          page: 1,
          size: 10
        },
        total: 0,
        propertyData: [],
        tableKey: 0,
        listLoading: false,
        // 音质相关
        qualityVisible: false,
        btnNQ: false,
        btnHQ: false,
        btnSQ: false,
        nqUrl: '',
        hqUrl: '',
        sqUrl: '',
        downMusicName: '',
        musicType: '',
      }
    },
    created() {
    },
    methods: {
      // 根据歌曲名称获取歌曲列表
      getMusicList: function(){
        this.listLoading = true
        let para = this.listPara
        para.name = this.musicName
        getKuGouMusicList(para).then(res =>{
          // console.log(res.data.data.lists)
          this.propertyData = res.data.data.info
          this.total = res.data.data.total
          this.listLoading = false
        });
      },
      // 回车搜索
      enterSearch: function(event){
        // console.log(event);
        if(event.key === 'Enter'){
          this.getMusicList()
        }
      },
      // 格式化hash数据
      filterHash: function(hashValue){
        if(hashValue == '' || hashValue == '00000000000000000000000000000000'){
          return '暂无信息'
        } else{
          return hashValue
        }
      },
      // 数据表格分页相关
      handleSizeChange(val){
        this.listPara.size = val
        this.getMusicList()
      },
      handleCurrentChange(val){
        this.listPara.page = val
        this.getMusicList()
      },
      // 通过filehash获取歌曲播放地址
      playMusic: function(row){
        this.isShow = false
        let para = {
          albumAudioId: row.album_audio_id,
          albumId: row.album_id,
          hash: row.hash
        };
        getKuGouMusicUrl(para).then(res =>{
          if(res.data.data.play_url === ''){
            this.$message({
              message: '酷狗都没有这首歌，不行就别听了',
              type: 'error'
            })
          } else{
            this.musicPlayer.url = res.data.data.play_url
            this.musicPlayer.title = res.data.data.song_name
            this.musicPlayer.author = res.data.data.author_name
            this.musicPlayer.pic = res.data.data.img
            this.musicPlayer.lrc = res.data.data.lyrics
            this.isShow = true
          }
        });
      },
      // 歌词下载
      downLrc: function(row){
        let para = {
          fileHash: row.FileHash
        };
        getKuGouMusicUrl(para).then(res =>{
          if(res.data.data.lyrics === ''){
            this.$message({
              message: '酷狗都没有这首歌的歌词，不行就别听了',
              type: 'error'
            })
          } else{
            const eleLink = document.createElement('a')
            eleLink.download = res.data.data.audio_name + '.lrc';
            eleLink.style.display = 'none'
            eleLink.target = '_blank'
            const blob = new Blob([res.data.data.lyrics])
            eleLink.href = URL.createObjectURL(blob)
            document.body.appendChild(eleLink)
            eleLink.click()
            document.body.removeChild(eleLink)
          }
        });
      },
      // 下载音乐
      // downMusic: function(row){
      //   const date = new Date();
      //   const timer = date.getTime().toString();
      //   let end = 0
      //   this.downMusicName = row.FileName
      //   // 普通音质
      //   if(row.FileHash != '' && row.FileHash != '00000000000000000000000000000000'){
      //     let paraNQ = {
      //       fileHash: row.FileHash,
      //       timer: timer
      //     }
      //     getKuGouMusicQualityUrl(paraNQ).then(res =>{
      //       if(res.data != ''){
      //         this.nqUrl = res.data
      //         this.btnNQ = true
      //       } else{
      //         this.nqUrl = ''
      //         this.btnNQ = false
      //       }
      //       end++
      //     });
      //   } else{
      //     this.nqUrl = ''
      //     this.btnNQ = false
      //     end++
      //   }
      //   // hq音质
      //   if(row.HQFileHash != '' && row.HQFileHash != '00000000000000000000000000000000'){
      //     let paraHQ = {
      //       fileHash: row.HQFileHash,
      //       timer: timer
      //     }
      //     getKuGouMusicQualityUrl(paraHQ).then(res =>{
      //       if(res.data != ''){
      //         this.hqUrl = res.data
      //         this.btnHQ = true
      //       } else{
      //         this.hqUrl = ''
      //         this.btnHQ = false
      //       }
      //       end++
      //     });
      //   } else{
      //     this.hqUrl = ''
      //     this.btnHQ = false
      //     end++
      //   }
      //   // sq音质
      //   if(row.SQFileHash != '' && row.SQFileHash != '00000000000000000000000000000000'){
      //     let paraSQ = {
      //       fileHash: row.SQFileHash,
      //       timer: timer
      //     }
      //     getKuGouMusicQualityUrl(paraSQ).then(res =>{
      //       if(res.data != ''){
      //         this.sqUrl = res.data
      //         this.btnSQ = true
      //       } else{
      //         this.sqUrl = ''
      //         this.btnSQ = false
      //       }
      //       end++
      //     });
      //   } else{
      //     this.sqUrl = ''
      //     this.btnSQ = false
      //     end++
      //   }
      //   let isEnd = setInterval(() =>{
      //     if(end >= 3){
      //       if(this.btnSQ||this.btnHQ||this.btnNQ){
      //         this.qualityVisible = true
      //         clearInterval(isEnd)
      //       } else{
      //         this.$message({
      //           message: '酷狗都没有这首歌，我也很无奈啊',
      //           type: 'error'
      //         })
      //         clearInterval(isEnd)
      //       }
      //     }
      //   }, 500)
      // },
      // 下载音乐普通音质
      downMusic: function(row){
        let para = {
          albumAudioId: row.album_audio_id,
          albumId: row.album_id,
          hash: row.hash
        };
        getKuGouMusicUrl(para).then(res =>{
          if(res.data.data.play_url === ''){
            this.$message({
              message: '酷狗都没有这首歌，不行就别听了',
              type: 'error'
            })
          } else{
            window.open(res.data.data.play_url);
          }
        });
      },
      getMusicFile: function(musicType){
        if(musicType == 'nq'){
          window.open(base.base() + '/kugou/sendmusic?musicUrl=' + this.nqUrl + '&musicName=' + this.downMusicName);
        } else if(musicType == 'hq'){
          window.open(base.base() + '/kugou/sendmusic?musicUrl=' + this.hqUrl + '&musicName=' + this.downMusicName);
        } else{
          window.open(base.base() + '/kugou/sendmusic?musicUrl=' + this.sqUrl + '&musicName=' + this.downMusicName);
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  lang="scss">
  .wl{
    width:1280px;
    margin:0 auto;
    position:relative;
  }
  .el-header{
    .logo{
      height:60px;
      text-align:right;
      float:left;
      width:0;
      img{
        height:100%;
      }
    }
    .title{
      float:left;
      width:1200px;
      text-align:center;
      line-height:60px;
      font-size:20px;
      font-weight:bold;
    }
  }
  /*搜索*/
  .search-b{
    padding-top:50px;
    width:800px;
    .user-in{
      text-align:center;
      width:70%;
      margin:0 auto;
    }
    .img-b{
      text-align:right;
      padding-right:30px;
      img{
        width:120px;
      }
    }
  }
  .player-bg{
    width:50%;
    margin:0 auto;
    padding:20px 0;
  }
  .pagination-container{
    padding:20px;
  }
</style>
