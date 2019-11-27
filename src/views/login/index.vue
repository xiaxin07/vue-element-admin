<template>
	<div class="loginBg">
      <h3>宝石花大健康视频问诊服务中心</h3>
      <div class="codeContainer">
          <span class="codeImg" v-if="ifgetCode">
            <img :src="codeurl">
          </span>
          <span class="codeImg" v-if="!ifgetCode">
            <p style="padding-top: 112px;">二维码获取失败</p>
            <p>请重新刷新页面</p>
          </span>
          <h4>{{loginInfo}}</h4>
      </div>
  </div>
</template>

<script>
  import Cookies from 'js-cookie'
  import { getCode, getLoginStatus } from '@/api/login'
  import { GetOs } from '@/utils/auth'
  import { debuglog } from 'util';
  import { constants } from 'fs';
  import routes from '@/router';
  export default{
    data(){
      return{
        loginInfo:'请使用手机微信扫码登录',
        codeurl:'',
        ifgetCode:false,
        clientOS:'',//当前操作系统
        clientIP:Cookies.get( 'ip' ),//外网ip
        accessToken:'',
        loginStatus:null,//当前用户登录状态码
        timer:null,
        userInfo:{}
      }
    },
    methods:{
      generaMenu(routes, data) {
        data.forEach(item => {
          // alert(JSON.stringify(item))
          const menu = {
            path: item.itemUrl === '#' ? item.sysMenuId + '_key' : item.itemUrl,
            component: item.itemUrl === '#' ? Layout : () => import(item.itemUrl),
            // hidden: true,
            children: [],
            name: 'menu_' + item.sysMenuId,
            meta: {
              title: item.menuName,
              id: item.sysMenuId,
              roles: [data.userType]
            }
          }
          if (item.children) {
            this.generaMenu(menu.children, item.children)
          }
          routes.push(menu)
        })
      },
      //获取医生或调度的登录二维码
      getCodeFn(){
        const params = {
          clientOS:'windows',
          clientIP:this.clientIP
        }
        //console.log(this.$store.state)
        getCode(params).then(res => {
           if(res){
             //console.log(res)
             this.ifgetCode = true;
             this.codeurl = res.data.data.qrCode
             this.accessToken = res.data.data.accessToken
             Cookies.set("accesstoken", this.accessToken)
           }
        })
        //console.log("当前操作系统："+ GetOs())
      },
      //获取调度登录状态
      getLoginStatusFn(){
        const params = {
          accessToken:this.accessToken
        }
        getLoginStatus(params).then(res => {
          //console.log(res)
          if(res.data.data){
            console.log("登陆成功返回信息：")
            console.log(res.data)
          }
          if(res){
            this.loginStatus = res.data.status
            if(this.loginStatus==0){
              this.loginInfo = "请使用手机微信扫码登录"
            }else if(this.loginStatus==1){
              this.loginInfo = "正在登录..."
              Cookies.set("loginstatus",true)
              Cookies.set( "userInfo",res.data.data )
              Cookies.set( "loginToken",res.data.token )
              this.userInfo = res.data.data
              this.$store.commit('user/SET_USERINFO',this.userInfo)
              //登录成功，清除计时器
              window.clearInterval(this.timer);
              this.$store.commit('user/SET_USERINFO',this.userInfo)
              this.$router.push('/')
              this.timer = null;
            }else if(this.loginStatus==2){
              this.loginInfo = "扫码成功，请在手机上确认登录"
            }
          }
        })
      }
    },
    created() {
      this.getCodeFn()
    },
    mounted() {
      Cookies.set( "ip",returnCitySN["cip"] )
      //轮询登录状态接口，更改状态
      this.timer = window.setInterval(() => {
          setTimeout(this.getLoginStatusFn(), 0)
      }, 1000)
    }
  }
</script>

<style scoped="scoped">
.loginBg{
  width: 100%;
  height: 100%;
  background:url(../../assets/login/loginBg.png) no-repeat center;
  background-size:100% 100%;
  position: relative;
}
h3{
  text-align: center;
  font: 40px/60px "PingFang SC";
  color: #fff;
  box-sizing: border-box;
  padding-top: 150px;
}
.codeContainer{
  background: #fff;
  margin: 50px auto 0;
  width: 300px;
  box-shadow: 0 0 10px 1px rgba(0,0,0,0.3);
  border-radius: 5px;
  box-sizing: border-box;
  padding: 20px;
}
.codeImg{
  display: block;
  width: 260px;
  height: 260px;
  background: #f6f6f6;
  margin-bottom: 15px;
  font: 16px/26px "微软雅黑";
  text-align: center;
  color: #999;
}
.codeContainer h4{
  font: 16px/40px "PingFang SC";
  color: #333;
  text-align: center;

}
</style>
