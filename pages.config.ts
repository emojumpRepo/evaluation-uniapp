import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { tabBar } from './src/layouts/fg-tabbar/tabbarList'

export default defineUniPages({
  entryPagePath: 'pages/home/index', // 入口页面路径
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'unibest',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^fg-(.*)': '@/components/fg-$1/fg-$1.vue',
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
    },
  },
  // tabbar 的配置统一在 “./src/layouts/fg-tabbar/tabbarList.ts” 文件中
  tabBar: tabBar as any,
  pages: [
    {
      path: 'pages/home/index',
      type: 'home',
      style: {
        navigationBarTitleText: '首页',
      },
      layout: 'tabbar',
    },
    {
      path: 'pages/evaluation/index',
      type: 'page',
      layout: 'tabbar',
      style: {
        navigationBarTitleText: '测评',
      },
    },
    {
      path: 'pages/home/detail',
      type: 'page',
      layout: 'default',
      style: {
        navigationBarTitleText: '问卷详情',
      },
    },
    {
      path: 'pages/user/index',
      type: 'page',
      layout: 'tabbar',
      style: {
        navigationBarTitleText: '用户中心',
        navigationBarBackgroundColor: '#ffffff',
        navigationBarTextStyle: 'black',
      },
    },
    {
      path: 'pages/user/personal',
      type: 'page',
      style: {
        navigationBarTitleText: '我的档案',
        navigationBarBackgroundColor: '#ffffff',
        navigationBarTextStyle: 'black',
      },
    },
  ],
})
