<template>
  <a-tabs default-active-key="2" @change="handleTabChange">
    <a-tab-pane key="1" tab="视频总结">
      <!-- 视频总结内容 -->
      {{ summary }}
    </a-tab-pane>
    <a-tab-pane key="2" tab="笔记">
      <div class="notes-container">
        <!-- 富文本编辑器 -->
        <div class="editor-section" v-if="showEditor">
          <quill-editor v-model="editorContent" @change="onEditorChange" ref="noteEditor" class="custom-quill-editor" />
          <div style="text-align: right">
            <a-button type="primary" @click="saveNote" :loading="saving" class="save-button"> 保存笔记 </a-button>
          </div>
        </div>

        <!-- 笔记列表 -->
        <div class="notes-list" v-if="notes.length > 0">
          <div v-for="(note, index) in notes" :key="index" class="note-item">
            <!-- 用户名和时间 -->
            <div class="note-header">
              <span class="username">{{ note.name }}</span>
              <span class="create-time">{{ note.createTime }}</span>
            </div>

            <!-- 笔记内容 -->
            <div class="note-content">
              <div :class="{ 'note-text': true, 'note-text-collapsed': !note.expanded }" :ref="`noteContent-${index}`" v-html="note.note"></div>

              <!-- 渐变遮罩和显示全文链接 -->
              <div v-if="!note.expanded && shouldShowCollapse(note.note, index)" class="note-overlay">
                <a href="javascript:;" @click="toggleNoteExpansion(index)" class="expand-link"> 显示全文 </a>
              </div>

              <!-- 收起链接 -->
              <div v-if="note.expanded" class="collapse-container">
                <a href="javascript:;" @click="toggleNoteExpansion(index)" class="collapse-link"> 收起 </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 无笔记提示 -->
        <empty v-else description="暂无笔记" />
      </div>
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import QuillEditor from "@/components/Editor/QuillEditor.vue";
import { getVideoNoteList, createVideoNote, getSummary } from "@/api/live";
import Empty from "@/components/Empty.vue";
import { formatDate } from "@/utils/common";

export default {
  name: "VideoNotes",
  props: { vid: { type: Number, required: true }, showEditor: { type: Boolean, default: false } },
  components: {
    QuillEditor,
    Empty,
  },
  data() {
    return {
      summary: "",
      activeTab: "2",
      editorContent: "",
      saving: false,
      notes: [],
    };
  },
  watch: {
    vid: {
      handler(newVal) {
        if (newVal) {
          this.fetchList();
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleTabChange(key) {
      this.activeTab = key;
    },

    onEditorChange(html) {
      this.editorContent = html;
    },

    fetchSummary() {
      getSummary(this.vid).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。")
          return;
        }
        this.summary = res.data;
      });
    },

    fetchList() {
      getVideoNoteList(this.vid).then(res => {
        this.notes = (res.list || []).map((el, i) => {
          el.createTime = formatDate(el.create_time);
          el.expanded = this.shouldShowCollapse(el.note, i) ? false : undefined;
          return el;
        });
      });
    },

    saveNote() {
      if (!this.editorContent) {
        this.$message.warning("请输入笔记内容");
        return;
      }
      this.saving = true;
      createVideoNote(this.vid, this.editorContent).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.fetchList();
        this.editorContent = "";
        this.saving = false;
      });
    },

    toggleNoteExpansion(index) {
      this.notes[index].expanded = !this.notes[index].expanded;
    },

    shouldShowCollapse(content, index) {
      return content.length > 200;
    },
  },
};
</script>

<style lang="less" scoped>
.notes-container {
  padding: 20px;
}

.editor-section {
  margin-bottom: 30px;

  .custom-quill-editor {
    :deep(.ql-container) {
      min-height: 150px;
      max-height: 450px;
    }
  }

  .save-button {
    margin-top: 15px;
  }
}

.notes-list {
  .note-item {
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .username {
        font-weight: bold;
        color: #333;
      }

      .create-time {
        color: #999;
        font-size: 12px;
      }
    }

    .note-content {
      position: relative;

      .note-text {
        line-height: 1.6;

        &.note-text-collapsed {
          max-height: 4.2em; // 约两行高度
          overflow: hidden;
        }
      }

      .note-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 5px;

        .expand-link {
          color: #1890ff;
          font-size: 12px;
        }
      }

      .collapse-container {
        text-align: right;
        margin-top: 5px;

        .collapse-link {
          color: #1890ff;
          font-size: 12px;
        }
      }
    }
  }
}

:deep(.ant-tabs-tabpane) {
  padding: 10px 0;
}

:deep(.ant-empty) {
  padding: 40px 0;
}
</style>
