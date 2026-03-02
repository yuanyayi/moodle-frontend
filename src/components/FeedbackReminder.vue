<template>
  <div class="feedback-reminder" :class="{ shake: shouldShake }">
    <div class="reminder-header">
      <a-icon :component="helpIcon" class="header-icon" />
      <span class="header-title">反馈提醒</span>
    </div>
    <div class="reminder-content">
      <!-- <button @click="triggerShake">测试震动</button> -->
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" :show-header="false"
        @change="handleTableChange">
        <template v-slot:msg="_, record">
          <span :class="record.handle ? 'status-success' : 'status-error'">
            {{ record.msg }}
          </span>
        </template>
        <template v-slot:handle="_, record">
          <span :class="record.handle ? 'status-success' : 'status-error'">
            <span class="statusDot"></span>
            {{ record.handle ? "已处理" : "未处理" }}
          </span>
        </template>
        <template v-slot:operations="_, record">
          <a-button v-if="!record.handle" size="small" type="primary" ghost @click="handleFeedback(record.id)"> 处理异常
          </a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { getFeedbackList, handleFeedback } from "@/api/livepage";
import { help } from "@/core/icons";

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
      helpIcon: help,
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
          width: 94,
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
        pageSize: 5,
      },
      pollTimer: null,
      previousCount: 0, // 记录上次的条目数
      shouldShake: false, // 控制是否震动
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0,
        showQuickJumper: true,
        size: "small",
        showTotal: total => `共 ${total} 条数据`,
      },
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
        };

        // 检查条目数是否增加，如果是则触发震动效果
        // if (currentCount > this.previousCount) {
        //   this.triggerShake();
        // }

        // 向父组件抛出当前计数
        this.$emit('count-change', currentCount);

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
      }, 10000);
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
    // 允许父组件手动刷新数据
    refresh() {
      this.fetch();
    },
  },
};
</script>

<style scoped>
.feedback-reminder {
  margin: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
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
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 4px;
}

.header-icon {
  margin-right: 8px;
  color: #1890ff;
  font-size: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

:deep(.ant-table-small)>.ant-table-content>.ant-table-body {
  margin: 0;
}

:deep(.ant-table-small)>.ant-table-content>.ant-table-body td {
  padding: 12px;
}

/* 状态颜色样式 */
.statusDot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-success {
  color: #73D13D;
}

.status-success .statusDot {
  background-color: #73D13D;
}

.status-error {
  color: #FF4D4F;
}

.status-error .statusDot {
  background-color: #FF4D4F;
}
</style>
