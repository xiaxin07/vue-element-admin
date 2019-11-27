<template>
  <div>
    <div style="overflow: hidden;" class="videoContainer">
        <div id="chatContent" style="border: 1px solid #cdcdcd;float: left;">
        </div>
        <!-- 播放对方画面的dom容器节点 -->
        <div id="remoteContainer" style="border: 1px solid #cdcdcd;float: left;">
          <!-- 按钮-->
          <img :src="endBtnUrl" alt="" id="endBtn">
        <!--  <img :src="muteBtnUrl" alt="" id="muteBtn">-->
        </div>
    </div>
  </div>
</template>

<script>
  import Cookies from "js-cookie";
  import endBtn from '@/assets/video/end.png'
  import muteBtn from '@/assets/video/mute.png'
  import { updateDoctor } from '@/api/doctor'
  export default{
    data(){
      return{
        inquirySheetId:'',
        channelName:'',
        endBtnUrl:endBtn,
        muteBtnUrl:muteBtn
      }
    },
    methods:{
      //更新医生状态
      updateDoctorFn(status){
      	const params = {
      		doctorId:this.$store.state.user.userInfo.userId,
      		doctorStatus:status
      	}
      	updateDoctor(params).then(res=>{
      		console.log(res)
      	})
      }

    },
    mounted() {
      console.log( 1111111111 )
      console.log(Cookies.get("sysmsg"))
      console.log( this.$store.state.user)
      console.log(this.$store.state.user.sysmsg)
      var that = this;
      var videoContainer = document.getElementById("chatContent");
      var remoteContainer = document.getElementById("remoteContainer");

      var userInfo = eval('(' + Cookies.get("userInfo") + ')');
      var sysmsg = eval('(' + Cookies.get("sysmsg") + ')');
      console.log(userInfo)
      console.log(sysmsg)
      // var userInfoJson = JSON.parse(userInfo);
      // var sysmsgJson = JSON.parse(sysmsg);
      
      SDK.NIM.use(WebRTC);
      //初始化SDK
      var nim = SDK.NIM.getInstance({
          //debug: true,
          // "account": that.$store.state.user.sysmsg,
          // "appKey": "ccca389251438bedb20f29c4994f2dba",
          // "token": "4b4898e789360f197fb3973e97a30ebe",
          "account": sysmsg.to,
          "appKey": "ccca389251438bedb20f29c4994f2dba",
          "token":userInfo.neteaseToken,
          onconnect:onconnect,
          ondisconnect: function(obj) {
              console.log('SDK 连接断开', obj);
          },
          onerror: function(error) {
              console.log('SDK 连接失败', error);
          }

      });
      console.log(  2222222222222222222)
      console.log( that.$store.state.user.sysmsg.to )
      console.log(  that.$store.state.user.userInfo.neteaseToken )
      //IM登录成功后初始化音视频实例: WebRTC.getInstance
      var webrtc = WebRTC.getInstance({
          nim: nim,
          container: videoContainer,
          remoteContainer: remoteContainer
              // 是否开启日志打印
              //debug: true
      });

      //SDK连接成功的回调
      function onconnect(){
        console.log('SDK 连接成功');
        console.log('---------------------------------医生收到系统通知----------------------------' );
        // Cookies.remove('sysmsgDoctor');
        
        // sysMsg = eval('(' + sysMsg + ')');
        // console.log(sysMsg)
        // // console.log(content['channelName'])
        // var content = JSON.parse(sysMsg.content);
        // that.channelName = content['channelName'];
        // that.inquirySheetId = content["inquirySheetId"];
        //var sysMsg = that.$store.state.user.sysmsg;

        console.log(33333333)
        // console.log(that.$store.state.user.sysmsg)
         
        var sysMsg = eval('(' + Cookies.get("sysmsg") + ')');
        var content = JSON.parse(sysMsg.content);
        console.log("channelName==== "+content['channelName']);
        // that.channelName = content['channelName'];
        // that.inquirySheetId = content["inquirySheetId"];
        //加入房间
        console.log('医生收到系统通知---------------加入房间--------------------------');
        that.updateDoctorFn(1);
        webrtc.joinChannel({
            channelName: content['channelName'],
            role: WebRTC.ROLE_PLAYER, //互动者
            type: Netcall.NETCALL_TYPE_VIDEO //视频

        }).then(function() {
            // 可以开启音视频连接操作。。。
            // 连接媒体网关
            console.log('医生收到系统通知---------------开启音视频连接操作--------------------------');
            webrtc.startRtc().then(function() {
                    // 开启麦克风
                    return webrtc.startDevice({
                        type: Netcall.DEVICE_TYPE_AUDIO_IN
                    }).catch(function(err) {
                        console.log('启动麦克风失败')
                        console.error(err)
                    })
                })
                .then(function() {
                    // 设置采集音量
                    webrtc.setCaptureVolume(255)
                        // 开启摄像头
                    return webrtc.startDevice({
                            type: Netcall.DEVICE_TYPE_VIDEO
                        })
                        .catch(function(err) {
                            console.log('启动摄像头失败')
                            console.error(err)
                        })
                })
                .then(function() {
                    //预览本地画面
                    webrtc.startLocalStream(
                            document.getElementById("chatContent")
                        )
                        // 设置本地预览画面大小
                    webrtc.setVideoViewSize({
                        width: 100,
                        height: 100,
                        cut: true
                    })
                })
                .catch(function(err) {
                    console.log('发生错误')
                    console.log(err)
                    webrtc.hangup()
                });
        });





      };
       
      //监听对方加入
      webrtc.on('remoteTrack', function(obj) {
          console.log('-------------------------------调度加入----------------------------------------', obj);
          // 播放对方声音
          webrtc.startDevice({
                  type: Netcall.DEVICE_TYPE_AUDIO_OUT_CHAT
              })
              .catch(function(err) {
                  console.log('播放对方的声音失败');
                  console.error(err);
              });
          // 预览对方视频画面
          webrtc.startRemoteStream({
              account: obj.account,
              node: document.getElementById("remoteContainer")
          });
          // 设置对方预览画面大小
          webrtc.setVideoViewRemoteSize({
              account: obj.account,
              width: 600,
              height: 600,
              cut: true
          });
      });
      //挂断音频
      $("#endBtn").click(function(){

        var userAgent = navigator.userAgent;
        if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") !=-1) {
        window.open('','_self').close();
        //window.location.href = "about:blank"
        }else {
        window.opener = null;
        window.open("about:blank", "_self");
        window.close();
        }
        hungUpFn();
        //清空vuex中存储的系统消息
         that.$store.commit('user/SET_SYSMSG',null);
         that.updateDoctorFn(0);
      })
      //挂断方法
      function hungUpFn(){
        webrtc.hangup(); //挂断
        webrtc.leaveChannel(); //离开房间
      }
      //收到挂断通知
       webrtc.on('hungUp', function() {
          hungUpFn();

           console.log("收到挂断通知----------------")
            var userAgent = navigator.userAgent;
            if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") !=-1) {
            window.open('','_self').close();
            //window.location.href = "about:blank"
            }else {
            window.opener = null;
            window.open("about:blank", "_self");
            window.close();
            }
       })
      //静音
    }
  }
</script>


<style scoped="scoped">
 .videoContainer{
   position: relative;
   /* width: 100%;
   height: 100%; */
   width: 500px;
   height: 300px;
 }
 .videoContainer #remoteContainer{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 5;
    /* background: pink; */
 }
 .videoContainer #chatContent{
   position: fixed;
   width: 20%;
   height: 30%;
   right: 0;
   top: 0;
   z-index: 80000;
   /* background: yellowgreen; */
 }
 #endBtn,#muteBtn{
   display: block;
   width: 40px;
   height: 40px;
   position: absolute;
   bottom: 5%;
 }
 #endBtn{
   left: 50%;
   margin-left: -20px;
   z-index: 200;
 }
 #muteBtn{
    left: 70%;
    z-index: 200;
 }
  #remoteContainer video,#chatContent video{
 	width: auto;
 	height: 100%;
 	left: 50%;
 	top: 0;
 }
</style>
