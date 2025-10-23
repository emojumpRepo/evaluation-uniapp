// https://www.npmjs.com/package/@uni-helper/unocss-preset-uni
import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUni({
      attributify: {
        // prefix: 'fg-', // 如果加前缀，则需要在代码里面使用 `fg-` 前缀，如：<div fg-border="1px solid #000"></div>
        prefixedOnly: true,
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    // 支持css class属性化
    presetAttributify(),
  ],
  transformers: [
    // 启用指令功能：主要用于支持 @apply、@screen 和 theme() 等 CSS 指令
    transformerDirectives(),
    // 启用 () 分组功能
    // 支持css class组合，eg: `<div class="hover:(bg-gray-400 font-medium) font-(light mono)">测试 unocss</div>`
    transformerVariantGroup(),
  ],
  shortcuts: [
    {
      center: 'flex justify-center items-center',
    },
  ],
  safelist: [],
  rules: [
    [
      'p-safe',
      {
        padding:
          'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      },
    ],
    ['pt-safe', { 'padding-top': 'env(safe-area-inset-top)' }],
    ['pb-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
  ],
  theme: {
    colors: {
      /** 主题色，用法如: text-primary */
      'primary': 'var(--wot-color-theme,#0957DE)',
      /** 柔和粉色 */
      'soft-pink': '#FFB6C1',
      /** 淡紫色 */
      'soft-purple': '#DDA0DD',
      /** 柔和蓝色 */
      'soft-blue': '#87CEEB',
      /** 柔和黄色 */
      'soft-yellow': '#FFE4B5',
      /** 淡橙色 */
      'soft-orange': '#FFDAB9',
      /** 柔和背景色 */
      'soft-bg': '#F8F9FA',
    },
    fontSize: {
      /** 提供更小号的字体，用法如：text-2xs */
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
    borderRadius: {
      /** 小圆角 */
      'xs': '16rpx',
      'sm': '20rpx',
      /** 中圆角 */
      'md': '24rpx',
      'lg': '32rpx',
      /** 大圆角 */
      'xl': '40rpx',
      '2xl': '50rpx',
    },
    boxShadow: {
      /** 轻阴影 */
      'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
      /** 中阴影 */
      'soft': '0 4px 12px rgba(0, 0, 0, 0.06)',
      /** 重阴影 */
      'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
    },
  },
})
