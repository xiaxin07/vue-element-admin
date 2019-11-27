<template>
  <div>
    <div>
        <div style="overflow: hidden;" class="videoContainer">
            <div id="chatContent"></div>
            <!-- 播放对方画面的dom容器节点 -->
            <div id="remoteContainer">
              <!-- 按钮-->
              <img :src="endBtnUrl" alt="" id="endBtn">
             <!-- <img :src="muteBtnUrl" alt="" id="muteBtn">-->
            </div>

        </div>

    </div>
    <!-- <el-button class="j-confirm" type='primary' size='small'>发起视频通话</el-button> -->
  </div>
</template>

<script>
import endBtn from '@/assets/video/end.png'
import muteBtn from '@/assets/video/mute.png'
import Cookies from "js-cookie";
import { updateDispatcher } from '@/api/dispatch'
  export default {
    data(){
      return{
        endBtnUrl:endBtn,
        muteBtnUrl:muteBtn
      }
    },
    methods:{
    	//更新调度状态
			updateDispatcherFn(){
				const params = {
					dispatcherId:this.$store.state.user.userInfo.userId,
					dispatcherStatus:0
				}
				updateDispatcher(params).then(res => {
					//console.log(res)
				})
			}

    },
    mounted() {
        var that = this;
        sessionStorage.setItem("hasOpenWindows", true);
        console.log( sessionStorage.getItem("hasOpenWindows") )
        var videoContainer = document.getElementById("chatContent");
        var remoteContainer = document.getElementById("remoteContainer");
        const oWidth = document.body.clientWidth;
        const oHeight = document.body.clientHeight;
        SDK.NIM.use(WebRTC);
        
        //初始化SDK
        var nim = SDK.NIM.getInstance({
            //debug: true,
            "account": that.$store.state.user.sysmsg.to,
            "appKey": "ccca389251438bedb20f29c4994f2dba",
            "token": that.$store.state.user.userInfo.neteaseToken,
            onconnect: onconnect,
            ondisconnect: ondisconnect,
            onerror: onerror,
        });

        //IM登录成功后初始化音视频实例: WebRTC.getInstance
        var webrtc = WebRTC.getInstance({
            // 是否开启日志打印
            //debug: true,
            nim: nim,
            container: videoContainer,
            remoteContainer: remoteContainer
        });
         var contentP = {
             channelName: "",
             inquirySheetId: ""
         };

        var channelName = "";
        var inquirySheetId = "";
        function onconnect() {
            console.log('SDK 连接成功');
            var sysMsg = Cookies.get('sysmsg');
            Cookies.remove("sysmsg");
            Cookies.set("sysmsgDoctor",sysMsg); //将系统消息保存下来传给医生
            sysMsg = eval('(' + sysMsg + ')');
            console.log( typeof sysMsg )
            console.log(sysMsg)
            console.log('调度收到自定义系统通知-----------------------------------------' + sysMsg);
            var content = JSON.parse(sysMsg.content);
            channelName = content['channelName'];
            inquirySheetId = content["inquirySheetId"];
            //加入房间
            console.log('调度收到自定义系统通知---------------加入房间--------------------------');
            webrtc.joinChannel({
                channelName: channelName,
                role: WebRTC.ROLE_PLAYER, //互动者
                type: Netcall.NETCALL_TYPE_VIDEO //视频

            }).then(function() {
                // 可以开启音视频连接操作。。。
                // 连接媒体网关
                console.log('调度收到自定义系统通知---------------开启音视频连接操作--------------------------');
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
        }

        function ondisconnect() {
            console.log('SDK 连接断开');
        }

        function onerror() {
            console.log('SDK 连接失败', error);
        }
        //发起视频通话
        // $(".j-confirm").click(function() {
        //     var contentP = {
        //         channelName: channelName,
        //         inquirySheetId: inquirySheetId
        //     };
        //     contentP = JSON.stringify(contentP);
        //     nim.sendCustomSysMsg({
        //         scene: "p2p", //点对点
        //         to: "doct_df0de5b05e0fec_74943", //调度账号
        //         content: contentP,
        //         sendToOnlineUsersOnly: true,
        //         done: sendCustomSysMsgDone
        //     });
        // });
        //挂断音频
        $("#endBtn").click(function(){
          hungUpFn();
          that.updateDispatcherFn();//更新调度状态
          that.$store.commit('user/SET_SYSMSG',null);
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
        //挂断方法
        function hungUpFn(){
          webrtc.hangup(); //挂断
          webrtc.leaveChannel(); //离开房间
        }
        //收到挂断通知
         webrtc.on('hungUp', function() {
            hungUpFn();
            console.log( "收到了挂断通知======================" )
         })
        //静音
        //发送系统消息成功之后回调函数
        function sendCustomSysMsgDone(error, msg) {
            console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient, error, msg);
        }
        //监听对方加入
        webrtc.on('remoteTrack', function(obj) {
            console.log('-------------------------------调度----------------------------------------', obj);
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
        webrtc.on('joinChannel', function(obj) {
            //医生加入调度自动退出
            if (obj.account.indexOf("doc") != -1) {
                webrtc.leaveChannel();
            }
            var userAgent = navigator.userAgent;
		        if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") !=-1) {
		        	window.open('','_self').close();
		        //window.location.href = "about:blank"
		        }else {
		        	window.opener = null;
		        	window.open("about:blank", "_self");
		        	window.close();
		        }
        });
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
   /*width: 20%;
   height: 30%;*/
   right: 0;
   top: 0;
   z-index: 8;
   /* background: yellowgreen; */
 }
 #remoteContainer video,#chatContent video{
 	width: auto;
 	height: 100%;
 	left: 50%;
 	top: 0;
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
</style>
