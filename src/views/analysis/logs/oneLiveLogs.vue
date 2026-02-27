<template>
  <div class="log-detail">
    <a-card :bordered="false">
      <!-- 直播基本信息 -->
      <div class="live-info-section">
        <div class="title" style="line-height:26px">{{ liveInfo.subject }}<status-tag
            :color="liveInfo.replay ? '#13C74F' : '#6E7079'" :text="liveInfo.replay ? '已开放回放' : '未开放回放'" /></div>
        <div>
          <span class="info-item">
            <a-icon :component="detail1" />
            <span class="label">相关课程：</span>
            <span class="value">{{ liveInfo.course_name }}</span>
          </span>
          <span class="info-item">
            <a-icon :component="detail2" />
            <span class="label">直播时间：</span>
            <span class="value">{{ formatTime(liveInfo.start_time, "YYYY-MM-DD HH:mm") }}</span>
          </span>
          <span class="info-item">
            <a-icon :component="detail3" />
            <span class="label">老师：</span>
            <span class="value">{{ liveInfo.teacher_name || "未知" }}</span>
          </span>
        </div>
      </div>

      <!-- 学生观看记录列表 -->
      <div class="student-records-section">
        <a-table
          :columns="columns"
          :data-source="studentRecords"
          :pagination="pagination"
          :loading="loading"
          row-key="student_id"
          @change="handleTableChange"
        >
          <template slot="action" slot-scope="text, record">
            <a-button type="link" @click="viewDetail(record)">查看详情</a-button>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 学生直播日志详情抽屉 -->
    <student-live-log-detail-drawer ref="studentLiveLogDetailDrawer" />
  </div>
</template>

<script>
import { fetchLogsByLive } from "@/api/logs";
import { formatTime } from "@/utils/common";
import { mapGetters } from "vuex";
import StatusTag from "@/components/Common/StatusTag.vue";
import StudentLiveLogDetailDrawer from "./detail/StudentLiveLogDetailDrawer.vue";
import { detail1, detail2, detail3 } from "@/core/icons";

export default {
  name: "LiveLogDetail",
  components: {
    StatusTag,
    StudentLiveLogDetailDrawer,
  },
  data() {
    return {
      detail1,
      detail2,
      detail3,
      liveConfigId: this.$route.params.live_config_id,
      liveInfo: {},
      loading: false,
      
      // 学生记录列表
      studentRecords: [],
      params: {
        page: 1,
        pageSize: 10,
      },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `共 ${total} 条数据`,
      },
      columns: [
        {
          title: "学生ID",
          dataIndex: "student_id",
          key: "student_id",
        },
        {
          title: "学生名称",
          dataIndex: "student_name",
          key: "student_name",
        },
        {
          title: "离开次数",
          dataIndex: "leave_num",
          key: "leave_num",
        },
        {
          title: "操作",
          key: "action",
          scopedSlots: { customRender: "action" },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      return this.roles.id || "student";
    },
  },
  mounted() {
    this.fetchStudentRecords();
  },
  methods: {
    fetchStudentRecords() {
      this.loading = true;
      const params = {
        ...this.params
      };
      
      fetchLogsByLive(this.liveConfigId, params).then((res) => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        
        // 接口返回的数据结构包含data和pageBean
        this.liveInfo = res.data || {};
        this.studentRecords = res.pageBean?.list || [];
        this.pagination.current = res.pageBean?.currentPage || 1;
        this.pagination.pageSize = res.pageBean?.pageSize || 10;
        this.pagination.total = res.pageBean?.allRow || 0;
      }).catch(error => {
        console.error("获取学生记录失败:", error);
        this.$message.error("获取学生记录失败");
      }).finally(() => {
        this.loading = false;
      });
    },
    handleTableChange(pagination) {
      this.params = {
        page: pagination.current,
        pageSize: pagination.pageSize
      };
      this.fetchStudentRecords();
    },
    viewDetail(record) {
      // 打开学生直播日志详情抽屉，传递学生信息
      this.$refs.studentLiveLogDetailDrawer.show(this.liveConfigId, record.student_id, {
        student_name: record.student_name,
        student_id: record.student_id
      });
    },
    // 添加t方法解决国际化问题
    t(key) {
      return this.$t(key);
    },
    formatTime,
  },
};
</script>

<style scoped>
.live-info-section {
  padding: 24px;
  background: url('@/assets/bg/image@2x.png') right center / auto 100%, linear-gradient(180deg, #F3F7FF 0%, rgba(243, 247, 255, 0) 100%);
  background-repeat: no-repeat;
  border-radius: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-flow: row wrap;

  .title {
    width: 100%;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .info-item {
    margin-right: 20px;

    >*+* {
      margin-left: 8px;
    }

    .anticon {
      vertical-align: middle;
      font-size: 22px;
    }

    .label {
      width: 100px;
      font-weight: 500;
      color: #666;
    }

    .value {
      flex: 1;
      color: #333;
    }
  }
}

.student-records-section {
  margin-top: 24px;
}
</style>