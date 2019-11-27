<template>
  <div>
    患者发起视频通话
    <div style="overflow: hidden;">
        <div id="chatContent" style="width: 500px;height: 500px;border: 1px solid #cdcdcd;float: left;"></div>

        <!-- 播放对方画面的dom容器节点 -->
        <div id="remoteContainer" style="width: 500px;height: 500px;border: 1px solid #cdcdcd;float: left;"></div>

    </div>
    <button class="j-confirm">发起视频通话</button>
  </div>
</template>

<script>
  export default{
    data(){
      return{

      }
    },
    methods:{

    },
    mounted() {
      var videoContainer = document.getElementById("chatContent");
      var remoteContainer = document.getElementById("remoteContainer");

      SDK.NIM.use(WebRTC);
      //初始化SDK
      var nim = SDK.NIM.getInstance({
          //debug: true,
          "account": "user_b0580ad9909e4f0_114",
          "appKey": "ccca389251438bedb20f29c4994f2dba",
          "token": "de16f73e494ec8235d902a89d019dc7a",
          onconnect: onconnect,
          ondisconnect: ondisconnect,
          onerror: onerror
      });

      function onconnect() {
          console.log('SDK 连接成功');
      }

      function ondisconnect() {
          console.log('SDK 连接断开');
      }

      function onerror() {
          console.log('SDK 连接失败', error);
      }
      //IM登录成功后初始化音视频实例: WebRTC.getInstance
      var webrtc = WebRTC.getInstance({
          // 是否开启日志打印
          //debug: true,
          nim: nim,
          container: videoContainer,
          remoteContainer: remoteContainer
      });


      var that = this
      //点击按钮发起通话
     // console.log( this.$store.state.user )
      var that = this;
      $(".j-confirm").click(function() {
          var channelName = Math.ceil(Math.random() * 10000);
          //1.第一步:获取调度用户
          //2.第二步:如下
          //创建房间
          console.log("-----------------------创建房间------------------------------------------");
          webrtc.createChannel({
              channelName: channelName,
              webrtcEnable: true
          }).then(function() {
              //加入房间
              console.log("-----------------------加入房间------------------------------------------");
              webrtc.joinChannel({
                  channelName: channelName,
                  role: WebRTC.ROLE_PLAYER, //互动者
                  type: Netcall.NETCALL_TYPE_VIDEO //视频

              });
          }).then(function() {
              var contentP = {
                  channelName: channelName,
                  inquirySheetId: '1'
              };
              contentP = JSON.stringify(contentP);
              //发送系统自定义消息
              console.log("-----------------------发送消息------------------------------------------");
              nim.sendCustomSysMsg({
                  scene: "p2p", //点对点
                  to:'disp_0ac1b5e0f4c2bd0_74946"', //调度账号
                  content: contentP,
                  sendToOnlineUsersOnly: true,
                  done: sendCustomSysMsgDone
              })

          }).then(function() {
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
                              type: Netcall.DEVICE_TYPE_VIDEO,
                              width: 640,
                              height: 480
                          })
                          .catch(function(err) {
                              console.log('启动摄像头失败')
                              console.error(err)
                          })
                  })
                  .then(function() {
                      //预览本地画面
                      webrtc.startLocalStream(
                              document.getElementById('chatContent')
                          )
                          // 设置本地预览画面大小
                      webrtc.setVideoViewSize({
                          width: 500,
                          height: 500,
                          cut: true
                      })
                  })
                  .then(function() {
                      // 设置互动者角色
                      webrtc.changeRoleToPlayer()
                  })
                  .catch(function(err) {
                      console.log('发生错误')
                      console.log(err)
                      webrtc.hangup()
                  })
          });
      });
      //发送系统消息成功之后回调函数
      function sendCustomSysMsgDone(error, msg) {
          console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient, error, msg);
      }
      //监听对方加入
      webrtc.on('remoteTrack', function(obj) {
          console.log('----------------------在回调里监听对方加入通话，并显示对方的视频画面-------------------------------', obj);
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
              width: 500,
              height: 500,
              cut: true
          });
      });
    }
  }
</script>

<style>
</style>
