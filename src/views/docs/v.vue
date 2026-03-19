<template>
  <div class="docs-page">
    <a-card :bordered="false" class="docs-card">
      <div v-if="loading" class="loading-container">
        <a-spin size="large" tip="文档加载中..." />
      </div>
      <div v-else-if="error" class="error-container">
        <a-result status="error" title="文档加载失败" :sub-title="error">
          <template #extra>
            <a-button type="primary" @click="loadDocument">重新加载</a-button>
          </template>
        </a-result>
      </div>
      <div v-else class="document-content" v-html="documentHtml"></div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import mammoth from 'mammoth'

export default {
  name: 'DocsPageV',
  data() {
    return {
      documentHtml: '',
      loading: false,
      error: ''
    }
  },
  computed: {
    ...mapGetters(['roles']),
    documentPath() {
      if (!this.roles || !this.roles.id) {
        return '/docs/杏林智慧直播平台视频版操作指引-教师.docx'
      }
      const roleMap = {
        'student': '/docs/杏林智慧直播平台视频版操作指引-学生.docx',
        'teacher': '/docs/杏林智慧直播平台视频版操作指引-教师.docx',
        'admin': '/docs/杏林智慧直播平台视频版操作指引-教师.docx',
        'dean': '/docs/杏林智慧直播平台视频版操作指引-教师.docx'
      }
      return roleMap[this.roles.id] || roleMap['teacher']
    }
  },
  mounted() {
    this.loadDocument()
  },
  methods: {
    async loadDocument() {
      this.loading = true
      this.error = ''
      try {
        const response = await fetch(this.documentPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer }, {
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Heading 1'] => h2:fresh",
            "p[style-name='Heading 2'] => h3:fresh",
            "p[style-name='Heading 3'] => h4:fresh"
          ]
        })
        this.documentHtml = result.value
        if (result.messages.length > 0) {
          console.warn('Mammoth messages:', result.messages)
        }
      } catch (err) {
        console.error('Error loading document:', err)
        this.error = err.message || '加载文档时发生错误'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.docs-page {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f0 100%);
  min-height: calc(100vh - 64px);

  .docs-card {
    max-width: 1000px;
    margin: 0 auto;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    background: #ffffff;
    padding: 40px 48px;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .error-container {
    padding: 40px 0;
  }

  .document-content {
    line-height: 1.8;
    color: #262626;
    font-size: 15px;

    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 24px 0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }

    :deep(video) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 24px 0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    :deep(h1) {
      font-size: 26px;
      font-weight: 700;
      margin: 32px 0 20px;
      color: #1a1a1a;
      border-bottom: 3px solid #1890ff;
      padding-bottom: 12px;
      letter-spacing: -0.3px;
    }

    :deep(h2) {
      font-size: 22px;
      font-weight: 600;
      margin: 28px 0 16px;
      color: #262626;
      padding-left: 16px;
      border-left: 4px solid #36cfc9;
    }

    :deep(h3) {
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px;
      color: #333;
      display: flex;
      align-items: center;

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #1890ff;
        border-radius: 50%;
        margin-right: 10px;
      }
    }

    :deep(h4) {
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0 10px;
      color: #595959;
    }

    :deep(p) {
      margin: 12px 0;
      text-align: justify;
      text-indent: 2em;
    }

    :deep(ul),
    :deep(ol) {
      margin: 16px 0;
      padding-left: 32px;

      li {
        margin: 8px 0;
        position: relative;
      }
    }

    :deep(ul) {
      list-style: none;

      li {
        &::before {
          content: '•';
          color: #1890ff;
          font-weight: bold;
          position: absolute;
          left: -18px;
          font-size: 18px;
        }
      }
    }

    :deep(ol) {
      li {
        &::marker {
          color: #1890ff;
          font-weight: 600;
        }
      }
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      th,
      td {
        border: 1px solid #e8e8e8;
        padding: 12px 16px;
        text-align: left;
        p {
          margin: 0;
          text-indent: 0;
        }
      }

      th {
        background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
        font-weight: 600;
        color: #262626;
      }

      tr:nth-child(even) {
        background-color: #fafafa;
      }

      tr:hover {
        background-color: #f0f7ff;
      }
    }

    :deep(strong) {
      font-weight: 600;
      color: #1890ff;
    }

    :deep(em) {
      font-style: italic;
      color: #595959;
    }

    :deep(blockquote) {
      margin: 20px 0;
      padding: 16px 20px;
      background: #f6ffed;
      border-left: 4px solid #52c41a;
      border-radius: 4px;
      color: #389e0d;

      p {
        margin: 0;
        text-indent: 0;
      }
    }

    :deep(code) {
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      color: #d4380d;
    }

    :deep(pre) {
      background: #1a1a1a;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;

      code {
        background: transparent;
        color: #e6e6e6;
        padding: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .docs-page {
    padding: 12px;

    .docs-card {
      padding: 24px 20px;
    }

    .document-content {
      font-size: 14px;

      :deep(h1) {
        font-size: 22px;
      }

      :deep(h2) {
        font-size: 19px;
      }

      :deep(h3) {
        font-size: 16px;
      }
    }
  }
}
</style>
