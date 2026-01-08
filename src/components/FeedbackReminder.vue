<template>
  <div class="feedback-reminder" :class="{ shake: shouldShake }">
    <div class="reminder-header">
      <span class="header-title">反馈提醒</span>
    </div>
    <div class="reminder-content">
      <!-- <button @click="triggerShake">测试震动</button> -->
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" :show-header="false" size="small" @change="handleTableChange">
        <template v-slot:msg="_, record">
          <span :class="record.handle ? 'status-success' : 'status-error'">
            {{ record.msg }}
          </span>
        </template>
        <template v-slot:handle="_, record">
          <span :class="record.handle ? 'status-success' : 'status-error'">
            {{ record.handle ? "已处理" : "未处理" }}
          </span>
        </template>
        <template v-slot:operations="_, record">
          <a-button v-if="!record.handle" size="small" @click="handleFeedback(record.id)"> 处理异常 </a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { getFeedbackList, handleFeedback, getFeedbackResult } from "@/api/livepage";

export default {
  name: "FeedbackReminder",
  props: {
    // 直播配置ID，用于从后端获取反馈列表
    liveConfigId: {
      type: [Number, String],
      required: true,
    },
    // 是否自动加载数据
    autoFetch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      columns: [
        {
          title: "动作",
          dataIndex: "msg",
          key: "msg",
          scopedSlots: { customRender: "msg" },
        },
        {
          title: "状态",
          dataIndex: "handle",
          key: "handle",
          scopedSlots: { customRender: "handle" },
          width: 60,
        },
        {
          title: "操作",
          key: "operations",
          scopedSlots: { customRender: "operations" },
          width: 80,
        },
      ],
      tableData: [],
      listParams: {
        page: 1,
        pageSize: 10,
      },
      pollTimer: null,
      previousCount: 0, // 记录上次的条目数
      shouldShake: false, // 控制是否震动
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
      },
      feedbackPollTimers: {}, // 存储每个反馈的轮询定时器
    };
  },
  watch: {
    liveConfigId: {
      handler(newVal) {
        if (newVal && this.autoFetch) {
          this.fetch();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    // 开始轮询，间隔1分钟
    if (this.autoFetch && this.liveConfigId) {
      this.startPolling();
    }
  },
  beforeDestroy() {
    // 组件销毁时清除定时器
    this.stopPolling();
    
    // 清理所有反馈轮询定时器
    Object.keys(this.feedbackPollTimers).forEach(feedbackId => {
      this.stopFeedbackPolling(feedbackId);
    });
  },
  methods: {
    fetch() {
      if (!this.liveConfigId) {
        console.warn("FeedbackReminder: liveConfigId is required to fetch data");
        return;
      }

      getFeedbackList(this.liveConfigId, this.listParams).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }

        // 保存当前条目数用于比较
        const currentCount = res.pageBean.allRow;

        this.tableData = res.pageBean.list || [];

        // 更新分页信息
        this.pagination = {
          ...this.pagination,
          current: res.pageBean.currentPage || 1,
          total: res.pageBean.allRow || 0,
          pageSize: res.pageBean.pageSize || 10,
        };

        // 检查条目数是否增加，如果是则触发震动效果
        if (currentCount > this.previousCount) {
          this.triggerShake();
        }

        // 更新之前的条目数
        this.previousCount = currentCount;
      });
    },

    startPolling() {
      // 先停止可能存在的定时器
      this.stopPolling();

      // 立即获取一次数据
      this.fetch();

      // 设置定时器，每1分钟获取一次数据
      this.pollTimer = setInterval(() => {
        this.fetch();
      }, 60000); // 1分钟 = 60000毫秒
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    triggerShake() {
      // 触发震动效果
      this.shouldShake = true;

      // 0.5秒后移除震动类，完成震动效果
      setTimeout(() => {
        this.shouldShake = false;
      }, 500);
    },

    handleTableChange(pagination, filters, sorter) {
      // 处理分页变化
      if (pagination) {
        this.listParams.page = pagination.current;
        this.listParams.pageSize = pagination.pageSize;
        this.fetch();
      }
    },

    handleFeedback(id) {
      handleFeedback(id).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.fetch();
      });
    },
    
    // 添加轮询检查特定反馈的处理状态
    startFeedbackPolling(feedbackId) {
      // 如果已经有轮询在进行，先清除它
      if (this.feedbackPollTimers[feedbackId]) {
        clearInterval(this.feedbackPollTimers[feedbackId]);
      }
      
      // 创建新的轮询
      this.feedbackPollTimers[feedbackId] = setInterval(() => {
        this.checkFeedbackStatus(feedbackId);
      }, 60000); // 每分钟检查一次
    },
    
    // 停止轮询
    stopFeedbackPolling(feedbackId) {
      if (this.feedbackPollTimers[feedbackId]) {
        clearInterval(this.feedbackPollTimers[feedbackId]);
        delete this.feedbackPollTimers[feedbackId];
      }
    },
    
    // 检查反馈状态
    async checkFeedbackStatus(feedbackId) {
      try {
        // 使用getFeedbackResult API检查特定反馈的状态
        const res = await getFeedbackResult(this.userId, feedbackId);
        
        if (!res.status) {
          const handleResult = res.data;
          
          // 更新表格数据中对应反馈的处理状态
          const index = this.tableData.findIndex(item => item.id == feedbackId);
          if (index !== -1) {
            // 更新handle状态
            this.$set(this.tableData[index], 'handle', handleResult);
            
            // 如果反馈已处理，则停止轮询
            if (handleResult) {
              this.stopFeedbackPolling(feedbackId);
              this.$message.success('反馈已处理');
            }
          }
        } else {
          console.error(`获取反馈 ${feedbackId} 状态失败:`, res.msg);
        }
      } catch (error) {
        console.error(`检查反馈 ${feedbackId} 状态失败:`, error);
      }
    },
    
    // 允许父组件手动刷新数据
    refresh() {
      this.fetch();
    },
  },
};
</script>

<style scoped>
.feedback-reminder {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: #fff;
  overflow: hidden;
  transition: all 0.3s ease;
  max-width: 400px;
}

/* 震动动画效果 */
.feedback-reminder.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.reminder-header {
  height: 30px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid #d9d9d9;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.reminder-content {
  padding: 10px;
}

:deep(.ant-table-small) > .ant-table-content > .ant-table-body {
  margin: 0;
}

/* 状态颜色样式 */
.status-success {
  color: green;
}

.status-error {
  color: red;
}
</style>
