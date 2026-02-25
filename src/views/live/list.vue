<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter"
        @clearQuery="clearQuery"></SearchForm>
    </div>
    <div style="padding-bottom: 12px">
      <a-button type="primary" @click="$refs.createModal.add()">新建直播</a-button>
    </div>

    <Empty v-if="!tableList.length" />
    <div class="table-list-container">
      <div v-for="(detail, index) in tableList" class="tableItem" :key="index">
        <div class="content">
          <p class="title">{{ detail.subject }}</p>
          <div class="info-item">
            <span class="info-label">相关课程</span>
            <span class="info-value">{{ detail.course_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">直播时间</span>
            <span class="info-value" v-if="detail.repeat">
              {{ readFromList(detail.repeat, repeatMap) }}{{ formatTime(detail.start_time, "YYYY-MM-DD HH:mm") }}
            </span>
            <span class="info-value" v-else>
              {{ formatTime(detail.start_time) }} - {{ formatTime(detail.end_time) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">老师</span>
            <span class="info-value">{{ detail.teacher_name }}</span>
          </div>

          <a-space class="action-btns">
            <a-button v-if="shouldShowEnterLiveButton(detail)" type="primary"
              @click="gotoCourseLive(detail.id)">进入直播间</a-button>
            <template v-if="role !== 'student'">
              <a-button v-if="shouldShowEnterBroadcastutton(detail)" type="primary"
                @click="gotoCourseBroadcast(detail.id)">进入开播</a-button>
            </template>
            <a-button v-if="detail.replay && detail.status === 3" class="greenBtn"
              @click="gotoReplayList(detail.id)">查看回放</a-button>
          </a-space>
        </div>

        <div class="frame">
          <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
          <a-icon type="play-circle" class="play-icon" />
        </div>

        <div class="flag">
          <span class="status-tag" :style="{ backgroundColor: getStatusColor(detail.status) }">{{
            getStatusText(detail.status) }}</span>
        </div>
      </div>
    </div>
    <a-pagination style="float: right" v-bind="pagination" @change="paginationChangeHandler" />

    <!--  -->
    <CreateLive ref="createModal" @ok="handleOk" />
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import APagination from "ant-design-vue/es/pagination";
import Empty from "@/components/Empty.vue";
import DetailList from "@/components/DetailList";
import { formatTime, readFromList } from "@/utils/common";
import { fetchLiveList, getLiveMaps, getCourseList, removeLiveConfig } from "@/api/live";
import CreateLive from "./CreateLive.vue";
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: "liveList",
  components: {
    SearchForm,
    APagination,
    Empty,
    DetailList,
    CreateLive,
  },
  data() {
    return {
      loading: false,
      queryField: {
        semester_id: {
          type: "select",
          label: "学期",
          list: [],
          onChange: this.getCoursesBySemester,
        },
        status: {
          type: "select",
          label: "直播状态",
          list: [],
        },
        subject: {
          type: "text", // select
          label: "直播名称",
          list: [],
        },
        start_time: {
          // start_time_begin start_time_stop
          type: "dateRange",
          label: "直播开始时间",
          items: { md: 16, lg: 8 },
        },
        course_id: {
          type: "select",
          label: "相关课程",
          list: [],
        },
      },
      queryParam: {
        semester_id: undefined,
        status: -1,
        subject: undefined,
        start_time: [],
        course_id: undefined,
      },
      listParam: {
        page: 1,
        pageSize: 10,
      },
      tableList: [],
      pagination: {
        simple: true,
        current: 1,
        total: 0,
      },
      repeatMap: [],
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      // 从store中获取用户角色，如果没有则默认为student
      return this.roles.id || "student";
    },
  },
  created() {
    this.getMaps().then(() => {
      this.fetch();
    });
  },
  methods: {
    getMaps() {
      // 先获取学期和课程映射
      return getLiveMaps(["repeat", "liveStatus", "semester"]).then(map => {
        this.queryField.semester_id.list = map.semesterMap;
        this.queryField.course_id.list = map.courseMap;
        this.queryField.status.list = map.liveStatusMap;

        this.queryParam.semester_id = map.semesterMap[0].value;
        // 在获取映射之后获取课程列表
        return getCourseList(map.semesterMap[0].value).then(courseMap => {
          this.queryField.course_id.list = courseMap.courseMap || [];
        });
      });
    },
    fetch() {
      this.loading = true;
      if (!this.queryParam.semester_id) {
        this.$message.error("请选择学期！");
        return;
      }
      let queryParam = { ...this.queryParam };
      if (queryParam.start_time.length) {
        queryParam.start_time_begin = queryParam.start_time[0].format("x");
        queryParam.start_time_stop = queryParam.start_time[1].format("x");
        delete queryParam.start_time;
      }

      fetchLiveList({
        ...queryParam,
        ...this.listParam,
      })
        .then(res => {
          this.tableList = res.pageBean.list.map(el => {
            el.statusByTime = this.getStatusByTime(el);
            !el.img && (el.img = "/defaultLive.jpg");
            return el;
          });
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(_ => {
          this.loading = false;
        });
    },
    // 添加根据学期ID获取课程列表的方法
    getCoursesBySemester(semesterId) {
      // 清空之前选择的课程
      this.queryParam.course_id = undefined;

      // 如果没有选择学期，则清空课程列表
      if (!semesterId) {
        this.queryField.course_id.list = [];
        return;
      }

      // 根据选择的学期获取课程列表
      getCourseList(semesterId)
        .then(res => {
          if (res && res.courseMap) {
            this.queryField.course_id.list = res.courseMap;
          } else {
            this.queryField.course_id.list = [];
          }
        })
        .catch(error => {
          console.error("获取课程列表失败:", error);
          this.$message.error("获取课程列表失败");
          this.queryField.course_id.list = [];
        });
    },
    queryFilter() {
      this.listParam.page = 1;
      this.fetch();
    },
    clearQuery() {
      this.listParam.page = 1;
      this.queryParam = {
        semester_id: this.queryField.semester_id.list[0].value || undefined,
        status: -1,
        subject: undefined,
        start_time: [],
        course_id: undefined,
      };
      this.fetch();
    },
    gotoCourseLive(liveConfigId) {
      // this.$router.push({
      //   name: "watch",
      //   params: { liveConfigId },
      // });
      const routeData = this.$router.resolve({
        name: "watch",
        params: { liveConfigId },
      });

      // 对于 history 模式，需要构建完整 URL
      const url = `${window.location.origin}${routeData.href}`;
      window.open(url, "_blank");
    },
    gotoReplayList(configId) {
      this.$router.push({
        name: "replayList",
        params: { configId },
      });
    },
    gotoCourseBroadcast(liveConfigId) {
      // this.$router.push({
      //   name: "broadcast",
      //   params: { liveConfigId },
      // });
      const routeData = this.$router.resolve({
        name: "broadcast",
        params: { liveConfigId },
      });

      // 对于 history 模式，需要构建完整 URL
      const url = `${window.location.origin}${routeData.href}`;
      window.open(url, "_blank");
    },
    handleOk() {
      this.fetch();
    },
    paginationChangeHandler(page, pageSize) {
      this.listParam = { page, pageSize };
      this.fetch();
    },
    removeLiveConfig(id) {
      this.$confirm({
        title: "删除直播",
        content: "确定要删除该直播吗？",
        icon: "warning",
        onOk: () => {
          removeLiveConfig(id).then(res => {
            if (res.status) {
              this.$message.error(res.msg || "操作失败，请稍后重试！");
            } else {
              this.$message.success("操作成功！");
              this.fetch();
            }
          });
        },
        okText: "删除",
        okType: "danger",
      });
    },
    // ---------- Filters ---------- //
    formatTime,
    readFromList,
    getStatusByTime(detail) {
      const now = new moment();
      let diffMinutes = this.role === "teacher" ? -30 : -10;
      if (now.isBefore(moment(detail.start_time).add(diffMinutes, "minutes"))) {
        return "未开始";
      } else if (now.isBefore(moment(detail.start_time))) {
        return "直播准备";
      } else if (now.isAfter(moment(detail.start_time).add(detail.duration, "minutes"))) {
        return "已结束";
      } else {
        return "正在直播";
      }
    },
    getStatusText(s) {
      return this.queryField.status.list.find(el => el.value == s)?.label || "未知的状态";
    },
    getStatusColor(s) {
      return ["#1890FF", "#52c41a", "#---", "#afafaf"][s] || "#87d068";
    },

    shouldShowEnterLiveButton(detail) {
      if (this.role === "teacher") return false;
      return true;
    },
    shouldShowEnterBroadcastutton(detail) {
      const now = moment();
      const startTime = moment(detail.start_time);
      const endTime = moment(detail.end_time);

      // 根据角色确定提前进入的时间
      // let minutesBeforeStart = 30;

      // const allowedStartTime = startTime.clone().subtract(minutesBeforeStart, "minutes");
      // return now.isBetween(allowedStartTime, endTime);
      return !now.isAfter(endTime);
    },
  },
};
</script>

<style lang="less" scope>
.table-list-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;

  .tableItem {
    box-sizing: border-box;
    padding: 16px;
    margin: 0 10px 20px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    display: flex;
    position: relative;
    width: calc(50% - 20px);
    height: 180px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .frame {
      flex: 0 0 auto;
      width: 200px;
      height: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;
      border-radius: 4px;
      background-color: #f5f5f5;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        cursor: pointer;
        font-size: 40px;
        opacity: 0.9;
      }
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding-right: 12px;

      .title {
        font-size: 16px;
        font-weight: 500;
        color: #262626;
        margin-bottom: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;

        .info-label {
          color: #8c8c8c;
          margin-right: 8px;
        }

        .info-value {
          color: #262626;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .action-btns {
        margin-top: auto;
        padding-top: 8px;
      }
    }

    .flag {
      position: absolute;
      right: 16px;
      bottom: 16px;

      .status-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
      }
    }
  }
}

.greenBtn {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;

  &:hover {
    background-color: #73d13d;
    border-color: #73d13d;
    color: #fff;
  }
}
</style>
