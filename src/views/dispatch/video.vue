<template>
  <div>
    调度视频通话
    <div>
        <div style="overflow: hidden;">
            <div id="chatContent" style="width: 500px;height: 500px;border: 1px solid #cdcdcd;float: left;"></div>

            <!-- 播放对方画面的dom容器节点 -->
            <div id="remoteContainer" style="width: 500px;height: 500px;border: 1px solid #cdcdcd;float: left;"></div>

        </div>

    </div>
    <el-button class="j-confirm">发起视频通话</el-button>
  </div>
</template>

<script>
  export default {
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
            "account": "disp_0ac1b5e0f4c2bd0_74943",
            "appKey": "ccca389251438bedb20f29c4994f2dba",
            "token": "900fb2e240755255f6dd6cc3e7472252",
            onconnect: onconnect,
            ondisconnect: ondisconnect,
            onerror: onerror,
            oncustomsysmsg: oncustomsysmsg
        });

        //IM登录成功后初始化音视频实例: WebRTC.getInstance
        var webrtc = WebRTC.getInstance({
            // 是否开启日志打印
            //debug: true,
            nim: nim,
            container: videoContainer,
            remoteContainer: remoteContainer
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
        var contentP = {
            channelName: "",
            inquirySheetId: ""
        };

        var channelName = "";
        var inquirySheetId = "";




        function oncustomsysmsg(sysMsg) {
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
                            width: 500,
                            height: 500,
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

        //发起视频通话
        $(".j-confirm").click(function() {
            var contentP = {
                channelName: channelName,
                inquirySheetId: inquirySheetId
            };
            contentP = JSON.stringify(contentP);
            nim.sendCustomSysMsg({
                scene: "p2p", //点对点
                to: "doct_df0de5b05e0fec_74943", //调度账号
                content: contentP,
                sendToOnlineUsersOnly: true,
                done: sendCustomSysMsgDone
            });
        });
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
                width: 500,
                height: 500,
                cut: true
            });
        });

        webrtc.on('joinChannel', function(obj) {
            //医生加入调度自动退出
            if (obj.account.indexOf("doc") != -1) {
                webrtc.leaveChannel();
                //设置调度为在线状态
            }
        });
    }
  }
</script>

<style>
</style>
