import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { getLoginStatus } from '@/api/login'  //获取用户的登录状态
import Cookies from 'js-cookie'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
import Layout from '@/layout'
const whiteList = ['/login'] // no redirect whitelist
import global from '@/components/Global'

export function generateMenu(routes, data) {
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
        roles: [global.userTypeMap.get(item.userType)]
      }
    }
    if (item.children) {
      this.generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = Cookies.get('loginstatus')
  next()
  if (hasToken) {
    debugger

    console.log(router)
    if (to.path === '/login') {
      NProgress.done()
      next(false)
    } else {
      // const hasRoles = store.getters.roles && store.getters.roles.length > 0
      const hasRoles = true
      // if (hasRoles) {
      //   next()
      // } else {
      try {
        // get user info
        // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
        // const { roles } = await store.dispatch('user/getInfo')

        // generate accessible routes map based on roles
        // const accessRoutes = await store.dispatch('permission/generateRoutes', 'admin')
        let accessRoutes
        const userInfo = store.getters.userInfo
        const userType = userInfo.userType
        const allMenu = userInfo.rbacMenuList
        const parentMenus = allMenu.filter(parent => parent.sysMenuPid === 0)
        const allChildren = allMenu.filter(parent => parent.sysMenuPid !== 0)

        parentMenus.forEach(parent => {
          const children = allChildren.filter(child => child.sysMenuPid === parent.sysMenuId)
          parent.children = children
          parent.userType = userType
        })
        generateMenu(accessRoutes, parentMenus)
        store.commit('SET_ROUTES', accessRoutes)
        // dynamically add accessible routes
        router.addRoutes(accessRoutes)

        // hack method to ensure that addRoutes is complete
        // set the replace: true, so the navigation will not leave a history record
        next({ ...to, replace: true })
      } catch (error) {
        // remove token and go to login page to re-login
        // await store.dispatch('user/resetToken')
        // Message.error(error || 'Has Error')
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
    //   next()
    // }
  } else {
    if (to.path === '/login') {
      NProgress.done()
      next()
    } else {
      NProgress.done()
      next('/login')
    }
  }
})

// router.beforeEach(async(to, from, next) => {
//   // start progress bar
//   NProgress.start()

//   // set page title
//   document.title = getPageTitle(to.meta.title)

//   // determine whether the user has logged in
//   const hasToken = getToken()

//   if (hasToken) {
//     if (to.path === '/login') {
//       // if is logged in, redirect to the home page
//       next({ path: '/' })
//       NProgress.done()
//     } else {
//       // determine whether the user has obtained his permission roles through getInfo
//       const hasRoles = store.getters.roles && store.getters.roles.length > 0
//       if (hasRoles) {
//         next()
//       } else {
//         try {
//           // get user info
//           // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
//           const { roles } = await store.dispatch('user/getInfo')

//           // generate accessible routes map based on roles
//           const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

//           // dynamically add accessible routes
//           router.addRoutes(accessRoutes)

//           // hack method to ensure that addRoutes is complete
//           // set the replace: true, so the navigation will not leave a history record
//           next({ ...to, replace: true })
//         } catch (error) {
//           // remove token and go to login page to re-login
//           await store.dispatch('user/resetToken')
//           Message.error(error || 'Has Error')
//           next(`/login?redirect=${to.path}`)
//           NProgress.done()
//         }
//       }
//     }
//   } else {
//     /* has no token*/

//     if (whiteList.indexOf(to.path) !== -1) {
//       // in the free login whitelist, go directly
//       next()
//     } else {
//       // other pages that do not have permission to access are redirected to the login page.
//       next(`/login?redirect=${to.path}`)
//       NProgress.done()
//     }
//   }
// })

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
