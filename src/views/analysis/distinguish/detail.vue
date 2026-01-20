<template>
  <a-card :bordered="false" class="distinguish-detail-container">
    <!-- 直播基本信息 -->
    <div class="live-info-section">
      <div class="info-row">
        <span class="label">相关课程：</span>
        <span class="value">{{ liveInfo.course_name }}</span>
      </div>
      <div class="info-row">
        <span class="label">直播主题：</span>
        <span class="value">{{ liveInfo.subject }}</span>
      </div>
      <div class="info-row">
        <span class="label">直播时间：</span>
        <span class="value">{{ formatTime(liveInfo.start_time, "YYYY-MM-DD HH:mm") }}</span>
      </div>
      <div class="info-row">
        <span class="label">老师：</span>
        <span class="value">{{ liveInfo.teacher_name || "未知" }}</span>
      </div>
      <div class="info-row">
        <span class="label">直播回放：</span>
        <span class="value">{{ liveInfo.replay ? "开放回放" : "未开放" }}</span>
      </div>
    </div>

    <!-- 学生考勤列表 -->
    <div style="text-align: right; margin-bottom: 12px">
      <a-button @click="downloadExcel(live_id)" icon="download">导出数据</a-button>
    </div>
    <div class="student-list-section">
      <a-table :columns="columns" :data-source="studentList" :pagination="pagination" :loading="loading" :row-key="record => record.student_id" @change="handleTableChange"> </a-table>
    </div>
  </a-card>
</template>

<script>
import { formatTime, readFromList } from "@/utils/common";
import { getStudentAttendanceList, downloadExcel } from "@/api/distinguish";
import { getLiveMaps } from "@/api/live";

export default {
  name: "DistinguishDetail",
  computed: {
    live_id() {
      return this.$route.params.id;
    },
  },
  data() {
    return {
      loading: false,
      liveInfo: {},
      studentList: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
      },
      listParam: {
        page: 1,
        pageSize: 20,
      },
      columns: [
        {
          title: <div class='nowrap'>学生ID</div>,
          dataIndex: "student_id",
          key: "student_id",
        },
        {
          title: <div class='nowrap'>学生名称</div>,
          dataIndex: "student_name",
          key: "student_name",
        },
        {
          title: <div class='nowrap'>人脸识别次数</div>,
          dataIndex: "count",
          key: "count",
        },
        {
          title: <div class='nowrap'>匹配成功次数</div>,
          dataIndex: "match_count",
          key: "match_count",
        },
        {
          title: <div class='nowrap'>考勤状态</div>,
          dataIndex: "status",
          key: "status",
          customRender: text => {
            return readFromList(text, this.attendanceStatusMap);
          },
        },
        {
          title: <div class='nowrap'>操作</div>,
          dataIndex: "id",
          key: "action",
          customRender: id => {
            return (
              <a-button size='small' onClick={() => this.gotoStudentDetail(id)}>
                查看详情
              </a-button>
            );
          },
        },
      ],
      attendanceStatusMap: [],
    };
  },
  created() {
    this.getMaps();
    this.fetch();
  },
  methods: {
    getMaps() {
      getLiveMaps(["attendanceStatus"]).then(map => {
        this.attendanceStatusMap = map.attendanceStatusMap;
      });
    },
    async fetch() {
      this.loading = true;

      try {
        // 获取学生考勤列表
        const res = await getStudentAttendanceList({
          live_id: this.live_id,
          ...this.listParam,
        });
        // 获取直播详情
        this.liveInfo = res.data;

        // 处理学生考勤数据
        this.studentList = res.pageBean.list.map(item => ({
          ...item,
          attendance_status: item.attendance_status || "pending",
        }));

        this.pagination.total = res.pageBean.allRow;
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        this.loading = false;
      }
    },

    handleTableChange(pagination, filters, sorter) {
      this.listParam.page = pagination.current;
      this.listParam.pageSize = pagination.pageSize;
      this.fetch();
    },

    gotoStudentDetail(attendance_status_id) {
      // 直接跳转到analysis模块中的学生人脸识别记录详情页
      this.$router.push({
        name: "studentFaceDetail",
        params: { id: attendance_status_id },
      });
    },

    getAttendanceStatusClass(status) {
      switch (status) {
        case "present":
          return "success";
        case "absent":
          return "danger";
        case "pending":
          return "warning";
        default:
          return "";
      }
    },

    getAttendanceStatusText(status) {
      switch (status) {
        case "present":
          return "出勤";
        case "absent":
          return "缺勤";
        case "pending":
          return "未处理";
        default:
          return status;
      }
    },

    downloadExcel,
    // ---------- Filters ---------- //
    formatTime,
  },
};
</script>

<style lang="less" scoped>
.distinguish-detail-container {
  margin-bottom: 24px;
}

.live-info-section {
  padding: 24px;
  background-color: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 24px;
  display: flex;
  flex-flow: row wrap;

  .info-row {
    flex: 50% 0 0;
    display: flex;
    margin-bottom: 12px;

    .label {
      width: 120px;
      font-weight: 500;
      color: #666;
    }

    .value {
      flex: 1;
      color: #333;
    }
  }
}

.student-list-section {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

// 状态样式
.success {
  color: #52c41a;
  font-weight: 500;
}

.danger {
  color: #f5222d;
  font-weight: 500;
}

.warning {
  color: #faad14;
  font-weight: 500;
}

// 表格样式
.ant-table {
  .ant-table-body {
    .ant-table-cell {
      padding: 12px 16px;
    }
  }
}
</style>
