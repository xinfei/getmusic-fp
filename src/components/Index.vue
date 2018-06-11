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
          <el-input placeholder="请输入歌曲名称" v-model="musicName" class="input-with-select">
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
      <div class="player-bg">
        <el-row>
          <el-col :span="4">
            <el-popover placement="top-start" trigger="hover">
              <div style="text-align: center">
                <el-progress color="#67C23A" type="circle" :percentage="music.volume"></el-progress><br>
                <el-button @click="changeVolume(-10)" icon="el-icon-minus" circle></el-button>
                <el-button @click="changeVolume(10)" icon="el-icon-plus" circle></el-button>
              </div>
              <el-button @click="play" id="play" slot="reference" :icon="music.isPlay?'el-icon-fly-pause':'el-icon-caret-right'" circle></el-button>
            </el-popover>
          </el-col>
          <el-col :span="14"  style="padding-left: 20px">
            <el-slider @change="changeTime" :format-tooltip="formatTime" :max="music.maxTime" v-model="music.currentTime" style="width: 100%;"></el-slider>
          </el-col>
          <el-col :span="6" style="padding: 9px 0px 0px 10px;color:#909399;font-size: 13px">
            {{formatTime(music.currentTime)}}/{{formatTime(music.maxTime)}}
          </el-col>
        </el-row>
        <audio ref="music" loop autoplay>
          <source v-bind:src="music.url" type="audio/mpeg">
        </audio>
      </div>
      <!--歌曲列表-->
      <el-table class="result-table" :key="tableKey" :data="propertyData" v-loading.body="listLoading" border fit >
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column align="center" label="歌曲名">
          <template slot-scope="scope">
            <span>{{scope.row.SongName}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="专辑名">
          <template slot-scope="scope">
            <span>{{scope.row.AlbumName}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="歌手名">
          <template slot-scope="scope">
            <span>{{scope.row.SingerName}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="FileHash">
          <template slot-scope="scope">
            <span v-html="filterHash(scope.row.FileHash)"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="HQFileHash">
          <template slot-scope="scope">
            <span v-html="filterHash(scope.row.HQFileHash)"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="SQFileHash">
          <template slot-scope="scope">
            <span v-html="filterHash(scope.row.SQFileHash)"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="MvHash">
          <template slot-scope="scope">
            <span v-html="filterHash(scope.row.MvHash)"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="300px" label="操作">
          <template slot-scope="scope">
            <el-button size="small" type="primary" @click="playMusic(scope.row)">试听</el-button>
            <el-button size="small" type="success" @click="downMusic(scope.row)">下载</el-button>
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
  import {getKuGouMusicList, getKuGouMusicUrl, getKuGouMusicQualityUrl} from "../api/ajax";
  import base from "../api/ajax";
  export default {
    data () {
      return {
        musicName: '',
        music:{
          isPlay:false,
          currentTime:0,
          maxTime:0,
          volume:50,
          url: ''
        },
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
        sqUrl: ''
      }
    },
    methods: {
      // 根据歌曲名称获取歌曲列表
      getMusicList: function(){
        this.listLoading = true
        let para = this.listPara
        para.name = this.musicName
        getKuGouMusicList(para).then(res => {
          // console.log(res.data.data.lists)
          this.propertyData = res.data.data.lists
          this.total = res.data.data.total
          this.listLoading = false
        });
      },
      // 格式化hash数据
      filterHash: function(hashValue) {
        if(hashValue == '' || hashValue == '00000000000000000000000000000000'){
          return '暂无信息'
        } else{
          return hashValue
        }
      },
      // 数据表格分页相关
      handleSizeChange(val) {
        this.listPara.size = val
        this.getMusicList()
      },
      handleCurrentChange(val) {
        this.listPara.page = val
        this.getMusicList()
      },
      // 通过filehash获取歌曲播放地址
      playMusic: function(row){
        let para = {
          fileHash: row.FileHash
        };
        getKuGouMusicUrl(para).then(res => {
          this.music.url = res.data.data.play_url
          this.$refs.music.load()
          this.$refs.music.volume = this.music.volume/100
          this.$nextTick(()=>{
            setInterval(this.listenMusic,1000)
          })
        });
      },
      // 下载音乐
      downMusic: function(row){
        const date = new Date();
        const timer = date.getTime().toString();
        let end = 0
        // 普通音质
        if (row.FileHash != '' && row.FileHash != '00000000000000000000000000000000') {
          let paraNQ = {
            fileHash: row.FileHash,
            timer: timer
          }
          getKuGouMusicQualityUrl(paraNQ).then(res => {
            if (res.data != '') {
              this.nqUrl = res.data
              this.btnNQ = true
            } else{
              this.nqUrl = ''
              this.btnNQ = false
            }
            end++
          });
        } else{
          this.nqUrl = ''
          this.btnNQ = false
          end++
        }
        // hq音质
        if (row.HQFileHash != '' && row.HQFileHash != '00000000000000000000000000000000') {
          let paraHQ = {
            fileHash: row.HQFileHash,
            timer: timer
          }
          getKuGouMusicQualityUrl(paraHQ).then(res => {
            if (res.data != '') {
              this.hqUrl = res.data
              this.btnHQ = true
            } else{
              this.hqUrl = ''
              this.btnHQ = false
            }
            end++
          });
        } else{
          this.hqUrl = ''
          this.btnHQ = false
          end++
        }
        // sq音质
        if (row.SQFileHash != '' && row.SQFileHash != '00000000000000000000000000000000') {
          let paraSQ = {
            fileHash: row.SQFileHash,
            timer: timer
          }
          getKuGouMusicQualityUrl(paraSQ).then(res => {
            if (res.data != '') {
              this.sqUrl = res.data
              this.btnSQ = true
            } else{
              this.sqUrl = ''
              this.btnSQ = false
            }
            end++
          });
        } else{
          this.sqUrl = ''
          this.btnSQ = false
          end++
        }
        let isEnd = setInterval(() => {
          if(end >= 3){
            this.qualityVisible = true
            clearInterval(isEnd)
          }
        }, 500)
      },
      getMusicFile: function(musicType) {
        if (musicType == 'nq') {
          window.open(base.base()+'/kugou/sendmusic?musicUrl='+nqUrl);
        } else if (musicType == 'hq') {
          window.open(base.base()+'/kugou/sendmusic?musicUrl='+hqUrl);
        } else {
          window.open(base.base()+'/kugou/sendmusic?musicUrl='+sqUrl);
        }
      },
      // 音乐播放相关
      listenMusic(){
        if(!this.$refs.music){
          return
        }
        if(this.$refs.music.readyState){
          this.music.maxTime = this.$refs.music.duration
        }
        this.music.isPlay=!this.$refs.music.paused
        this.music.currentTime = this.$refs.music.currentTime
      },
      play(){
        if(this.$refs.music.paused){
          this.$refs.music.play()
        }else{
          this.$refs.music.pause()
        }
        this.music.isPlay=!this.$refs.music.paused
        this.$nextTick(()=>{
          document.getElementById('play').blur()
        })
      },
      changeTime(time){
        this.$refs.music.currentTime = time
      },
      changeVolume(v){
        this.music.volume += v
        if(this.music.volume>100){
          this.music.volume = 100
        }
        if(this.music.volume<0){
          this.music.volume = 0
        }
        this.$refs.music.volume = this.music.volume/100
      },
      formatTime(time){
        let it = parseInt(time)
        let m = parseInt(it/60)
        let s = parseInt(it%60)
        return (m<10?"0":"")+parseInt(it/60)+":"+(s<10?"0":"")+parseInt(it%60)
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
