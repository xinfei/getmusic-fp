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
        <el-table-column align="center" label="文件hash">
          <template slot-scope="scope">
            <span>{{scope.row.FileHash}}</span>
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
    <!--下载隐藏按钮-->
    <a href="" download="" ref="downmusic"></a>
  </el-container>
</template>

<script>
  import {getKuGouMusicList, getKuGouMusicUrl} from "../api/ajax";

  export default {
    data () {
      return {
        musicName: '',
        music:{
          isPlay:false,
          currentTime:0,
          maxTime:0,
          volume:50,
          // url: 'http://sc1.111ttt.cn:8282/2018/1/03m/13/396131232171.m4a?tflag=1519095601&pin=6cd414115fdb9a950d827487b16b5f97#.mp3'
          url: ''
        },
        listPara: {
          page: 1,
          size: 10
        },
        total: 0,
        propertyData: [],
        tableKey: 0,
        listLoading: false
      }
    },
    // mounted(){
    //   this.$nextTick(()=>{
    //     setInterval(this.listenMusic,1000)
    //   })
    // },
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
        let para = {
          fileHash: row.FileHash
        };
        getKuGouMusicUrl(para).then(res => {
          if(res.data.data.play_url){
            this.$refs.downmusic.href = res.data.data.play_url;
            this.$refs.downmusic.download = row.SongName+'.mp3';
            this.$refs.downmusic.click();
            // window.open(res.data.data.play_url)
          }
        });
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
