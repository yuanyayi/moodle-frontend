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
import soundT1 from "@/assets/sounds/t1.m4a";
import soundT2 from "@/assets/sounds/t2.m4a";

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
      audioQueue: [], // 音频播放队列
      isPlaying: false, // 是否正在播放
      audioInstance: null, // 单例 Audio 对象
      playTimeout: null, // 播放超时定时器
      MAX_QUEUE_LENGTH: 5, // 队列最大长度阈值
      PLAY_TIMEOUT: 5000, // 播放超时时间（5 秒）
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
    if (this.autoFetch && this.liveConfigId) {
      this.startPolling();
    }
    // 初始化单例 Audio 对象
    this.audioInstance = new Audio();
  },
  beforeDestroy() {
    // 组件销毁时清除定时器
    this.stopPolling();
    // 清空音频队列，停止正在播放的音频
    this.audioQueue = [];
    this.isPlaying = false;
    // 清理超时定时器
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
    // 清理单例 Audio 对象
    if (this.audioInstance) {
      this.audioInstance.onended = null;
      this.audioInstance.onerror = null;
      this.audioInstance.src = '';
      this.audioInstance.load();
      this.audioInstance = null;
    }
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
        const newData = res.pageBean.list || [];

        // 检查是否有新增项
        if (currentCount > this.previousCount) {
          // 找出新增的项
          const newItems = this.findNewItems(newData);
          // 处理新增项并播放提示音
          this.processNewItems(newItems);
        }

        this.tableData = newData;

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

      // 定时器轮询，接近实时
      this.pollTimer = setInterval(() => {
        this.fetch();
      }, 5000);
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
    // 找出新增的项
    findNewItems(newData) {
      const oldIds = new Set(this.tableData.map(item => item.id));
      return newData.filter(item => !oldIds.has(item.id));
    },
    // 处理新增项并添加到播放队列
    processNewItems(newItems) {
      // 提取需要播放的 type，去重
      const typesToPlay = [];
      const playedTypes = new Set();

      newItems.forEach(item => {
        const type = item.type;
        // 只处理 type 为 1 或 2 的情况
        if ((type === 1 || type === 2) && !playedTypes.has(type)) {
          typesToPlay.push(type);
          playedTypes.add(type);
        }
      });

      // 将需要播放的类型加入队列
      if (typesToPlay.length > 0) {
        this.audioQueue.push(...typesToPlay);
        
        // 监控队列长度，超过阈值时清空队列
        if (this.audioQueue.length > this.MAX_QUEUE_LENGTH) {
          console.warn(`[FeedbackReminder] 队列长度超过阈值 (${this.MAX_QUEUE_LENGTH})，当前长度：${this.audioQueue.length}，已清空队列`);
          this.audioQueue = [];
          this.isPlaying = false;
          return;
        }
        
        // 如果当前没有在播放，开始播放
        if (!this.isPlaying) {
          this.playNextAudio();
        }
      }
    },
    // 播放下一个音频
    playNextAudio() {
      // 如果队列为空，结束播放
      if (this.audioQueue.length === 0) {
        this.isPlaying = false;
        return;
      }

      // 标记为正在播放
      this.isPlaying = true;

      // 从队列头部取出一个类型
      const type = this.audioQueue.shift();
      
      // 选择对应的音频文件
      const audioSrc = type === 1 ? soundT1 : soundT2;

      // 使用单例 Audio 对象
      const audio = this.audioInstance;
      audio.src = audioSrc;
      audio.load();

      // 清除之前的超时定时器
      if (this.playTimeout) {
        clearTimeout(this.playTimeout);
        this.playTimeout = null;
      }

      // 设置播放超时保护
      this.playTimeout = setTimeout(() => {
        console.warn(`[FeedbackReminder] 音频播放超时（type=${type}），已强制停止`);
        // 清理事件监听器
        audio.onended = null;
        audio.onerror = null;
        // 停止播放
        audio.pause();
        audio.currentTime = 0;
        // 继续播放下一个
        this.playNextAudio();
      }, this.PLAY_TIMEOUT);

      // 播放完成后的回调
      const onEndedHandler = () => {
        // 清除超时定时器
        if (this.playTimeout) {
          clearTimeout(this.playTimeout);
          this.playTimeout = null;
        }
        // 清理事件监听器，避免内存泄漏
        audio.onended = null;
        audio.onerror = null;
        // 重置音频状态
        audio.src = '';
        audio.load();
        // 播放下一个音频
        this.playNextAudio();
      };

      // 播放出错时的处理
      const onErrorHandler = () => {
        console.error(`[FeedbackReminder] 音频播放失败：type=${type}`);
        // 清除超时定时器
        if (this.playTimeout) {
          clearTimeout(this.playTimeout);
          this.playTimeout = null;
        }
        // 清理事件监听器
        audio.onended = null;
        audio.onerror = null;
        // 重置音频状态
        audio.src = '';
        audio.load();
        // 继续播放下一个
        this.playNextAudio();
      };

      // 绑定事件监听器
      audio.onended = onEndedHandler;
      audio.onerror = onErrorHandler;

      // 开始播放
      audio.play().catch(err => {
        console.error(`[FeedbackReminder] 音频播放错误：type=${type}`, err);
        // 清除超时定时器
        if (this.playTimeout) {
          clearTimeout(this.playTimeout);
          this.playTimeout = null;
        }
        // 清理事件监听器
        audio.onended = null;
        audio.onerror = null;
        // 重置音频状态
        audio.src = '';
        audio.load();
        // 继续播放下一个
        this.playNextAudio();
      });
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

:deep(.ant-table) .ant-table-tbody {
  margin: 0;
}

:deep(.ant-table) .ant-table-tbody>tr>td {
  padding: 8px;
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
