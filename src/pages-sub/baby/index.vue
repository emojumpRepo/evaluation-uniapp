<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "宝宝管理"
  }
}
</route>

<script setup lang="ts">
import type { ExportAssessmentRespVO } from '@/api/baby'
import type { BabyFile, IBabyInfo } from '@/api/types/baby'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { exportAllAssessmentsPdf, exportAssessmentFiles, exportAssessmentPackage, exportAssessmentPdf, getAssessmentResultList, getBabyFileList } from '@/api/baby'
import { useBabyStore } from '@/store/index'

const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

const selectedBaby = ref<IBabyInfo | null>(null)
const fileList = ref<BabyFile[]>([])
const loading = ref(false)
const showExportModal = ref(false)
const assessmentResultId = ref<number | null>(null)

/**
 * 编辑宝宝
 * @param baby 宝宝信息
 */
function handleEditBaby(baby: IBabyInfo) {
  selectedBaby.value = baby
  uni.navigateTo({
    url: `/pages-sub/baby/add?id=${selectedBaby.value?.id}`,
  })
}

/**
 * 添加宝宝
 */
function navigateToAdd() {
  if (babyList.value.length >= 2) {
    uni.showToast({
      title: '最多可添加两个宝宝哦~',
      icon: 'none',
    })
    return
  }

  uni.navigateTo({
    url: '/pages-sub/baby/add',
  })
}

/**
 * 查看附件列表
 * @param baby 宝宝信息
 */
function handleViewFiles(baby: IBabyInfo) {
  selectedBaby.value = baby
  loadBabyFiles(baby.id)
}

/**
 * 导出测评报告
 * @param baby 宝宝信息
 */
function handleExportReport(baby: IBabyInfo) {
  selectedBaby.value = baby
  // 这里可以获取该宝宝最新的测评结果ID，暂时让用户在需要时输入
  assessmentResultId.value = null
  showExportModal.value = true
}

/**
 * 加载宝宝附件
 * @param babyId 宝宝ID
 */
async function loadBabyFiles(babyId: number) {
  try {
    loading.value = true
    const res = await getBabyFileList(babyId)
    fileList.value = res.data || []
  }
  catch (error) {
    console.error('加载附件列表失败:', error)
    uni.showToast({
      title: '加载附件失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

/**
 * 关闭附件弹窗
 */
function closeFilesModal() {
  selectedBaby.value = null
  fileList.value = []
}

/**
 * 下载文件
 * @param file 文件信息
 */
async function downloadFile(file: BabyFile) {
  try {
    uni.showLoading({
      title: '获取下载链接...',
    })

    // 调用后端下载接口获取下载链接
    const downloadRes = await uni.request({
      url: `/member/baby/file/download`,
      method: 'GET',
      data: { id: file.id },
    })

    uni.hideLoading()

    if (downloadRes.statusCode === 200 && downloadRes.data.code === 0 && downloadRes.data.data) {
      const downloadUrl = downloadRes.data.data
      console.log('获取到下载链接:', downloadUrl)

      // 直接使用 uni.downloadFile 下载文件
      uni.downloadFile({
        url: downloadUrl,
        success: (downloadFileRes) => {
          if (downloadFileRes.statusCode === 200) {
            uni.showToast({
              title: '下载成功',
              icon: 'success',
            })

            // 如果是图片，提供预览选项
            if (file.fileType.startsWith('image/')) {
              uni.showActionSheet({
                itemList: ['预览图片', '分享文件'],
                success: (res) => {
                  if (res.tapIndex === 0) {
                    // 预览图片
                    uni.previewImage({
                      urls: [downloadFileRes.tempFilePath],
                      current: downloadFileRes.tempFilePath,
                    })
                  }
                  else if (res.tapIndex === 1) {
                    // 分享文件
                    shareFile(downloadFileRes.tempFilePath, file.fileName)
                  }
                },
              })
            }
            else {
              // 非图片文件，尝试打开文档
              uni.openDocument({
                filePath: downloadFileRes.tempFilePath,
                showMenu: true,
                success: () => {
                  console.log('打开文档成功')
                },
                fail: (err) => {
                  console.error('打开文档失败', err)
                  uni.showToast({
                    title: '文件已下载，请查看',
                    icon: 'success',
                  })
                },
              })
            }
          }
          else {
            uni.showToast({
              title: '下载失败',
              icon: 'error',
            })
          }
        },
        fail: (error) => {
          console.error('下载文件失败:', error)
          uni.showToast({
            title: '下载失败',
            icon: 'error',
          })
        },
      })
    }
    else {
      console.error('获取下载链接失败:', downloadRes)
      uni.showToast({
        title: '获取下载链接失败',
        icon: 'error',
      })
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('下载失败:', error)
    uni.showToast({
      title: '下载失败',
      icon: 'error',
    })
  }
}

/**
 * 分享文件
 * @param filePath 文件路径
 * @param fileName 文件名称
 */
function shareFile(filePath: string, fileName: string) {
  // 在小程序中分享文件
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 5, // 文件类型
    filePath,
    success: () => {
      uni.showToast({
        title: '分享成功',
        icon: 'success',
      })
    },
    fail: (error) => {
      console.error('分享失败:', error)
      uni.showToast({
        title: '分享失败',
        icon: 'error',
      })
    },
  })
}

/**
 * 导出测评报告（PDF格式）
 */
/**
 * 下载测评结果PDF报告 - 显示测评选择列表
 */
async function downloadAssessmentResultPdf() {
  if (!selectedBaby.value)
    return

  try {
    uni.showLoading({
      title: '加载测评列表...',
    })

    // 获取该宝宝的所有测评结果
    const res = await getAssessmentResultList(selectedBaby.value.id!)
    uni.hideLoading()

    if (!res.data || res.data.length === 0) {
      uni.showToast({
        title: '暂无测评记录',
        icon: 'none',
      })
      return
    }

    // 按完成时间降序排序（最新的在前）
    const sortedList = res.data.sort((a, b) => {
      return new Date(b.completedTime).getTime() - new Date(a.completedTime).getTime()
    })

    // 构建选择列表（只显示最新的3条）
    const itemList = sortedList.slice(0, 3).map((item, index) => {
      const date = new Date(item.completedTime).toLocaleDateString('zh-CN')
      const badge = index === 0 ? '🆕 ' : ''
      return `${badge}${item.assessmentTitle} (${date})`
    })

    // 显示选择框
    uni.showActionSheet({
      title: '选择要导出的测评',
      itemList,
      success: async (actionRes) => {
        const selectedIndex = actionRes.tapIndex
        const selectedAssessment = sortedList[selectedIndex]

        try {
          uni.showLoading({
            title: '生成PDF中...',
          })

          // 调用导出单个测评报告的接口
          const exportRes = await exportAssessmentPdf(selectedBaby.value!.id!, selectedAssessment.id)

          console.log('[导出] 接口返回:', JSON.stringify(exportRes.data))
          console.log('[导出] status:', exportRes.data.status)
          console.log('[导出] downloadUrl:', exportRes.data.downloadUrl)
          console.log('[导出] fileName:', exportRes.data.fileName)
          console.log('[导出] fileSize:', exportRes.data.fileSize)

          if (exportRes.data.status === 2) {
            // 导出成功
            closeExportModal()
            uni.hideLoading()
            console.log('[导出] 导出成功，准备下载文件')
            downloadExportedFile(exportRes.data)
          }
          else if (exportRes.data.status === 3) {
            // 导出失败
            uni.hideLoading()
            console.error('[导出] 导出失败，status=3')
            uni.showToast({
              title: '导出失败，请重试',
              icon: 'error',
            })
          }
          else {
            // 处理中
            uni.hideLoading()
            console.warn('[导出] 导出处理中，status=', exportRes.data.status)
            uni.showToast({
              title: '正在生成，请稍后...',
              icon: 'none',
            })
          }
        }
        catch (error) {
          uni.hideLoading()
          console.error('下载测评报告失败:', error)
          uni.showToast({
            title: '下载失败',
            icon: 'error',
          })
        }
      },
    })
  }
  catch (error) {
    uni.hideLoading()
    console.error('获取测评列表失败:', error)
    uni.showToast({
      title: '加载测评列表失败',
      icon: 'error',
    })
  }
}

async function exportPdf() {
  if (!selectedBaby.value)
    return

  try {
    uni.showLoading({
      title: '生成PDF中...',
    })

    // 调用导出所有测评的PDF接口
    const res = await exportAllAssessmentsPdf(selectedBaby.value.id!)

    console.log('[导出全部PDF] 接口返回:', JSON.stringify(res.data))
    console.log('[导出全部PDF] status:', res.data.status)
    console.log('[导出全部PDF] downloadUrl:', res.data.downloadUrl)

    if (res.data.status === 2) {
      // 导出成功，获取下载链接
      closeExportModal()
      uni.hideLoading()
      console.log('[导出全部PDF] 导出成功，准备下载')
      downloadExportedFile(res.data)
    }
    else if (res.data.status === 3) {
      // 导出失败
      uni.hideLoading()
      console.error('[导出全部PDF] 导出失败，status=3')
      uni.showToast({
        title: '导出失败，请重试',
        icon: 'error',
      })
    }
    else {
      // 处理中
      uni.hideLoading()
      console.warn('[导出全部PDF] 导出处理中，status=', res.data.status)
      uni.showToast({
        title: '正在生成，请稍后...',
        icon: 'none',
      })
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('导出PDF失败:', error)
    uni.showToast({
      title: '导出失败',
      icon: 'error',
    })
  }
}

/**
 * 导出测评附件
 */
async function exportFiles() {
  if (!selectedBaby.value)
    return

  try {
    uni.showLoading({
      title: '打包附件中...',
    })

    // 调用导出附件接口
    const res = await exportAssessmentFiles(selectedBaby.value.id!)

    console.log('[导出附件] 接口返回:', JSON.stringify(res.data))
    console.log('[导出附件] status:', res.data.status)
    console.log('[导出附件] downloadUrl:', res.data.downloadUrl)

    if (res.data.status === 2) {
      // 导出成功，获取下载链接
      closeExportModal()
      uni.hideLoading()
      console.log('[导出附件] 导出成功，准备下载')
      downloadExportedFile(res.data)
    }
    else if (res.data.status === 3) {
      // 导出失败
      uni.hideLoading()
      console.error('[导出附件] 导出失败，status=3')
      uni.showToast({
        title: '导出失败，请重试',
        icon: 'error',
      })
    }
    else {
      // 处理中
      uni.hideLoading()
      console.warn('[导出附件] 导出处理中，status=', res.data.status)
      uni.showToast({
        title: '正在打包，请稍后...',
        icon: 'none',
      })
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('导出附件失败:', error)
    uni.showToast({
      title: '导出失败',
      icon: 'error',
    })
  }
}

/**
 * 导出完整测评报告包
 */
async function exportPackage() {
  if (!selectedBaby.value)
    return

  try {
    uni.showLoading({
      title: '生成完整报告包...',
    })

    // 调用导出完整报告包接口
    const res = await exportAssessmentPackage(selectedBaby.value.id!)

    console.log('[导出报告包] 接口返回:', JSON.stringify(res.data))
    console.log('[导出报告包] status:', res.data.status)
    console.log('[导出报告包] downloadUrl:', res.data.downloadUrl)

    if (res.data.status === 2) {
      // 导出成功，获取下载链接
      closeExportModal()
      uni.hideLoading()
      console.log('[导出报告包] 导出成功，准备下载')
      downloadExportedFile(res.data)
    }
    else if (res.data.status === 3) {
      // 导出失败
      uni.hideLoading()
      console.error('[导出报告包] 导出失败，status=3')
      uni.showToast({
        title: '导出失败，请重试',
        icon: 'error',
      })
    }
    else {
      // 处理中
      uni.hideLoading()
      console.warn('[导出报告包] 导出处理中，status=', res.data.status)
      uni.showToast({
        title: '正在打包，请稍后...',
        icon: 'none',
      })
    }
  }
  catch (error) {
    uni.hideLoading()
    console.error('导出完整报告包失败:', error)
    uni.showToast({
      title: '导出失败',
      icon: 'error',
    })
  }
}

/**
 * 下载导出的文件
 * @param exportData 导出响应数据
 */
function downloadExportedFile(exportData: ExportAssessmentRespVO) {
  console.log('[下载] 准备下载文件:', exportData.fileName)
  console.log('[下载] 文件URL:', exportData.downloadUrl)
  console.log('[下载] 文件大小:', exportData.fileSize)

  // 检查必要字段
  if (!exportData.downloadUrl) {
    console.error('[下载] downloadUrl 为空，无法下载')
    uni.showToast({
      title: 'downloadUrl为空',
      icon: 'error',
    })
    return
  }

  uni.showModal({
    title: '导出成功',
    content: `文件已生成：${exportData.fileName}\n大小：${formatFileSize(exportData.fileSize)}\n\n是否立即下载？`,
    confirmText: '下载',
    cancelText: '稍后',
    success: (res) => {
      if (res.confirm) {
        console.log('[下载] 用户点击下载，开始下载文件')
        // 下载文件
        uni.downloadFile({
          url: exportData.downloadUrl,
          success: (downloadRes) => {
            console.log('[下载] 下载响应:', downloadRes)
            console.log('[下载] statusCode:', downloadRes.statusCode)
            console.log('[下载] tempFilePath:', downloadRes.tempFilePath)

            if (downloadRes.statusCode === 200) {
              // 保存到永久目录
              uni.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                success: (saveRes) => {
                  console.log('[下载] 文件已保存:', saveRes.savedFilePath)

                  // 根据文件类型处理
                  if (exportData.fileName.endsWith('.pdf')) {
                    // PDF文件：尝试打开
                    console.log('[下载] 是PDF文件，尝试打开')
                    uni.openDocument({
                      filePath: saveRes.savedFilePath,
                      fileType: 'pdf',
                      showMenu: true,
                      success: () => {
                        console.log('[下载] 打开PDF成功')
                        uni.showToast({
                          title: '下载成功',
                          icon: 'success',
                        })
                      },
                      fail: (err) => {
                        console.error('[下载] 打开PDF失败', err)
                        uni.showModal({
                          title: '下载成功',
                          content: `文件已保存，但无法自动打开。\n请在文件管理器中查看：\n${exportData.fileName}`,
                          showCancel: false,
                        })
                      },
                    })
                  }
                  else if (exportData.fileName.endsWith('.zip')) {
                    // ZIP文件：提示用户
                    console.log('[下载] 是ZIP文件，提示用户')
                    uni.showModal({
                      title: '下载成功',
                      content: `文件已保存到本地：\n${exportData.fileName}\n\n请在文件管理器中查看和解压。`,
                      confirmText: '知道了',
                      showCancel: false,
                    })
                  }
                  else {
                    // 其他文件：显示下载成功
                    uni.showToast({
                      title: '下载成功',
                      icon: 'success',
                      duration: 2000,
                    })
                  }
                },
                fail: (saveErr) => {
                  console.error('[下载] 保存文件失败', saveErr)
                  // 即使保存失败，临时文件仍可用
                  uni.showToast({
                    title: '下载成功（临时文件）',
                    icon: 'success',
                    duration: 2000,
                  })
                },
              })
            }
            else {
              console.error('[下载] 下载失败，statusCode:', downloadRes.statusCode)
              uni.showToast({
                title: `下载失败: ${downloadRes.statusCode}`,
                icon: 'error',
              })
            }
          },
          fail: (err) => {
            console.error('[下载] 下载失败', err)
            uni.showToast({
              title: `下载失败: ${err.errMsg || '未知错误'}`,
              icon: 'error',
            })
          },
        })
      }
      else {
        console.log('[下载] 用户选择稍后下载')
      }
    },
  })
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}

/**
 * 打开文档
 * @param filePath 文件路径
 * @param fileName 文件名称
 */
function openDocument(filePath: string, fileName: string) {
  uni.openDocument({
    filePath,
    fileType: fileName.endsWith('.pdf') ? 'pdf' : 'docx',
    success: () => {
      console.log('打开文档成功')
    },
    fail: (error) => {
      console.error('打开文档失败:', error)
      uni.showToast({
        title: '打开失败',
        icon: 'error',
      })
    },
  })
}

/**
 * 关闭导出弹窗
 */
function closeExportModal() {
  showExportModal.value = false
  selectedBaby.value = null
}

/**
 * 获取文件类型图标
 * @param fileType 文件类型
 */
function getFileIcon(fileType: string) {
  const iconMap: Record<string, string> = {
    'application/pdf': 'file-text',
    'image/jpeg': 'image',
    'image/png': 'image',
    'application/msword': 'file-text',
    'application/vnd.ms-excel': 'file-text',
  }
  return iconMap[fileType] || 'file-unknown'
}

/**
 * 格式化日期
 * @param timestamp 时间戳或日期字符串
 */
function formatDate(timestamp: string | number): string {
  if (!timestamp)
    return '-'

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

onMounted(() => {
  // 页面加载时可以预加载附件列表
})
</script>

<template>
  <view class="min-h-screen px-4 py-6" style="background: linear-gradient(to bottom, #f8fafc, #f1f5f9);">
    <!-- 页面标题 -->
    <view class="mb-6">
      <view class="mb-1 text-2xl text-gray-800 font-bold">
        宝宝管理
      </view>
      <view class="text-sm text-gray-500">
        管理您的宝宝信息和测评档案
      </view>
    </view>

    <!-- 宝宝列表 -->
    <div v-if="babyList.length > 0" class="mb-6 flex flex-col gap-4">
      <div
        v-for="baby in babyList"
        :key="baby.name"
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
        style="border: 1px solid rgba(226, 232, 240, 0.8);"
      >
        <div class="p-5">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex flex-1 items-center">
              <view class="relative mr-4">
                <image
                  class="h-14 w-14 rounded-full"
                  style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);"
                  :src="baby.avatar || 'http://test.yudao.iocoder.cn/user/avatar/20250715/G0bTIS90DRSvc90f423c08a6cb7bb3ab969a5301474c_1752564908905.png'"
                  mode="aspectFill"
                />
                <view
                  class="absolute h-5 w-5 flex items-center justify-center rounded-full -bottom-1 -right-1"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 2px 6px rgba(0,0,0,0.15);"
                >
                  <wd-icon name="edit-outline" size="12px" color="white" />
                </view>
              </view>
              <div class="flex-1">
                <div class="mb-1.5 text-lg text-gray-900 font-bold">
                  {{ baby.name }}
                </div>
                <view class="flex items-center">
                  <wd-icon name="time" custom-class="mr-1.5" size="13px" color="#94a3b8" />
                  <text class="text-sm text-gray-500">
                    {{ baby.birthday }}
                  </text>
                </view>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <view class="flex gap-2">
            <view
              class="flex flex-1 items-center justify-center rounded-xl py-3"
              style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 1px solid #667eea30;"
              @click="handleViewFiles(baby)"
            >
              <wd-icon name="folder-open" custom-class="mr-1.5" size="16px" color="#667eea" />
              <text class="text-sm font-medium" style="color: #667eea;">
                附件
              </text>
            </view>
            <view
              class="flex flex-1 items-center justify-center rounded-xl py-3"
              style="background: linear-gradient(135deg, #06b6d415 0%, #0891b215 100%); border: 1px solid #06b6d430;"
              @click="handleExportReport(baby)"
            >
              <wd-icon name="share1" custom-class="mr-1.5" size="16px" color="#06b6d4" />
              <text class="text-sm font-medium" style="color: #06b6d4;">
                导出
              </text>
            </view>
            <view
              class="flex flex-1 items-center justify-center rounded-xl py-3"
              style="background: linear-gradient(135deg, #f59e0b15 0%, #f97316215 100%); border: 1px solid #f59e0b30;"
              @click="handleEditBaby(baby)"
            >
              <wd-icon name="edit-outline" custom-class="mr-1.5" size="16px" color="#f59e0b" />
              <text class="text-sm font-medium" style="color: #f59e0b;">
                编辑
              </text>
            </view>
          </view>
        </div>
      </div>
    </div>

    <!-- 添加宝宝按钮 -->
    <view v-if="babyList.length < 2">
      <div
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
        style="border: 2px dashed #cbd5e1;"
        @click="navigateToAdd"
      >
        <view class="flex flex-col items-center justify-center py-8">
          <view
            class="mb-3 h-16 w-16 flex items-center justify-center rounded-full"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            <wd-icon name="add-circle1" size="28px" color="white" />
          </view>
          <text class="mb-1 text-base text-gray-700 font-medium">
            添加宝宝
          </text>
          <text class="text-xs text-gray-400">
            建立宝宝的专属测评档案
          </text>
        </view>
      </div>
    </view>

    <!-- 温馨提示 -->
    <view v-if="babyList.length > 0" class="mt-6">
      <view
        class="rounded-2xl p-4"
        style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd;"
      >
        <view class="flex items-start">
          <view class="mr-3 flex-shrink-0">
            <wd-icon name="info" size="18px" color="#0284c7" />
          </view>
          <view class="flex-1">
            <text class="mb-2 block text-sm font-medium" style="color: #0369a1;">
              温馨提示
            </text>
            <text class="block text-xs leading-relaxed" style="color: #0c4a6e;">
              • 点击附件可查看和下载宝宝的测评相关文件
            </text>
            <text class="mt-1 block text-xs leading-relaxed" style="color: #0c4a6e;">
              • 点击导出可生成测评报告PDF或打包下载
            </text>
            <text class="mt-1 block text-xs leading-relaxed" style="color: #0c4a6e;">
              • 点击编辑可修改宝宝的基本信息
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 附件弹窗 -->
  <view v-if="selectedBaby" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <view class="mx-4 max-h-[80vh] max-w-md w-11/12 overflow-hidden rounded-2xl bg-white shadow-2xl">
      <!-- 弹窗头部 -->
      <view class="flex items-center justify-between border-b p-4" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-bottom: 1px solid #e2e8f0;">
        <view class="flex flex-1 items-center">
          <image
            class="mr-3 h-10 w-10 rounded-full"
            style="border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
            :src="selectedBaby.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="flex-1">
            <div class="text-lg text-gray-800 font-bold">
              {{ selectedBaby.name }}
            </div>
            <div class="mt-1 flex items-center text-sm text-gray-600">
              <wd-icon name="folder-open" custom-class="mr-1" size="14px" color="#6b7280" />
              <text>共 {{ fileList.length }} 个附件</text>
            </div>
          </view>
        </view>
        <view
          class="h-8 w-8 flex items-center justify-center rounded-full"
          style="background: #f1f5f9; border: 1px solid #e2e8f0;"
          @click="closeFilesModal"
        >
          <wd-icon name="close" size="18px" color="#6b7280" />
        </view>
      </view>

      <!-- 附件列表 -->
      <view class="max-h-[60vh] overflow-y-auto p-4">
        <view v-if="loading" class="flex items-center justify-center py-12">
          <wd-loading color="#3b82f6" />
          <text class="ml-3 text-base text-gray-600">
            加载中...
          </text>
        </view>

        <view v-else-if="fileList.length > 0" class="space-y-2">
          <view
            v-for="file in fileList"
            :key="file.id"
            class="flex items-start border border-gray-100 rounded-xl p-4 shadow-sm"
            style="background: linear-gradient(to right, #eff6ff, #faf5ff);"
          >
            <view class="min-w-0 flex flex-1 items-start">
              <view class="mr-3 flex-shrink-0">
                <wd-icon
                  :name="getFileIcon(file.fileType)"
                  custom-class="text-blue-500"
                  size="28px"
                />
              </view>
              <view class="min-w-0 flex-1">
                <div class="mb-2 break-words text-base text-gray-900 font-semibold">
                  {{ file.fileName }}
                </div>
                <view class="mb-1 flex items-center">
                  <wd-icon name="time" custom-class="text-gray-400 mr-1" size="14px" />
                  <text class="text-xs text-gray-500">
                    {{ formatDate(file.createTime) }}
                  </text>
                </view>
                <div v-if="file.description" class="mt-2 break-words rounded-lg p-2 text-sm text-gray-700" style="background: rgba(255,255,255,0.6);">
                  {{ file.description }}
                </div>
              </view>
            </view>

            <view class="ml-3 flex flex-shrink-0 items-center gap-3">
              <view
                class="h-10 w-10 flex items-center justify-center rounded-full"
                style="background: #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
                @click="downloadFile(file)"
              >
                <wd-icon
                  name="download"
                  custom-class="text-white"
                  size="18px"
                />
              </view>
            </view>
          </view>
        </view>

        <view v-else class="py-16 text-center">
          <wd-icon name="folder-open" custom-class="text-gray-300 mb-3" size="56px" />
          <text class="block text-base text-gray-400">
            暂无附件
          </text>
          <text class="mt-2 block text-sm text-gray-400">
            上传的附件将显示在这里
          </text>
        </view>
      </view>

      <!-- 弹窗底部 -->
      <view class="border-t bg-gray-50 p-4">
        <wd-button type="primary" block @click="closeFilesModal">
          确定
        </wd-button>
      </view>
    </view>
  </view>

  <!-- 导出报告弹窗 -->
  <view v-if="showExportModal && selectedBaby" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <view class="mx-4 max-w-md w-11/12 overflow-hidden rounded-2xl bg-white shadow-2xl">
      <!-- 弹窗头部 -->
      <view
        class="flex items-center justify-between p-5"
        style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-bottom: 1px solid #e2e8f0;"
      >
        <view class="flex flex-1 items-center">
          <image
            class="mr-3 h-10 w-10 rounded-full"
            style="border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
            :src="selectedBaby.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="flex-1">
            <div class="mb-1 text-base text-gray-800 font-bold">
              {{ selectedBaby.name }}
            </div>
            <div class="text-sm text-gray-600">
              📊 选择导出格式
            </div>
          </view>
        </view>
        <view
          class="h-8 w-8 flex items-center justify-center rounded-full"
          style="background: #f1f5f9; border: 1px solid #e2e8f0;"
          @click="closeExportModal"
        >
          <text class="text-lg text-gray-600 font-bold">
            ×
          </text>
        </view>
      </view>

      <!-- 导出选项 -->
      <view class="p-5">
        <view class="flex flex-col gap-3">
          <!-- 下载测评结果PDF报告 -->
          <view
            class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            style="border: 1px solid #e5e7eb;"
            @click="downloadAssessmentResultPdf"
          >
            <view class="flex flex-1 items-center">
              <view
                class="mr-3 h-11 w-11 flex flex-shrink-0 items-center justify-center rounded-lg"
                style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);"
              >
                <text class="text-xl">
                  📄
                </text>
              </view>
              <view class="flex-1">
                <div class="mb-0.5 text-gray-900 font-semibold">
                  测评结果报告
                </div>
                <div class="text-xs text-gray-500">
                  下载指定测评的PDF报告
                </div>
              </view>
            </view>
            <text class="text-lg text-gray-400">
              ›
            </text>
          </view>

          <!-- 导出PDF报告 -->
          <view
            class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            style="border: 1px solid #e5e7eb;"
            @click="exportPdf"
          >
            <view class="flex flex-1 items-center">
              <view
                class="mr-3 h-11 w-11 flex flex-shrink-0 items-center justify-center rounded-lg"
                style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);"
              >
                <text class="text-xl">
                  📋
                </text>
              </view>
              <view class="flex-1">
                <div class="mb-0.5 text-gray-900 font-semibold">
                  PDF报告
                </div>
                <div class="text-xs text-gray-500">
                  生成测评报告PDF文件
                </div>
              </view>
            </view>
            <text class="text-lg text-gray-400">
              ›
            </text>
          </view>

          <!-- 导出附件 -->
          <view
            class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            style="border: 1px solid #e5e7eb;"
            @click="exportFiles"
          >
            <view class="flex flex-1 items-center">
              <view
                class="mr-3 h-11 w-11 flex flex-shrink-0 items-center justify-center rounded-lg"
                style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);"
              >
                <text class="text-xl">
                  📁
                </text>
              </view>
              <view class="flex-1">
                <div class="mb-0.5 text-gray-900 font-semibold">
                  附件打包
                </div>
                <div class="text-xs text-gray-500">
                  下载所有相关附件ZIP
                </div>
              </view>
            </view>
            <text class="text-lg text-gray-400">
              ›
            </text>
          </view>

          <!-- 导出完整包 -->
          <view
            class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            style="border: 1px solid #e5e7eb;"
            @click="exportPackage"
          >
            <view class="flex flex-1 items-center">
              <view
                class="mr-3 h-11 w-11 flex flex-shrink-0 items-center justify-center rounded-lg"
                style="background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);"
              >
                <text class="text-xl">
                  📦
                </text>
              </view>
              <view class="flex-1">
                <div class="mb-0.5 text-gray-900 font-semibold">
                  完整报告包
                </div>
                <div class="text-xs text-gray-500">
                  PDF报告+所有附件打包
                </div>
              </view>
            </view>
            <text class="text-lg text-gray-400">
              ›
            </text>
          </view>
        </view>
      </view>

      <!-- 弹窗底部 -->
      <view class="border-t p-4" style="background: white;">
        <view
          class="rounded-xl py-3 text-center"
          style="background: #f1f5f9;"
          @click="closeExportModal"
        >
          <text class="text-base text-gray-700 font-medium">
            取消
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
