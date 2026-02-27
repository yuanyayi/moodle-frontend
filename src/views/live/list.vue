<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" :autoCreatedFetch="false" @queryFilter="queryFilter"
        @clearQuery="clearQuery"></SearchForm>
    </div>
    <!-- 隐藏功能 -->
    <!-- <div style="padding-bottom: 12px; text-align: right;">
      <a-button type="primary" @click="$refs.createModal.add()">新建直播</a-button>
    </div> -->

    <Empty v-if="!tableList.length" />
    <div class="table-container">
      <div v-for="(detail, index) in tableList" class="tableItem">
        <div class="content">
          <p>{{ detail.subject }}</p>
          <p><a-icon :component="detail2" /><b>直播时间:</b>{{ formatTime(detail.start_time) }} ~ {{
            formatTime(detail.end_time, "hh-mm-ss") }}</p>
          <p><a-icon :component="detail1" /><b>相关课程：</b>{{ detail.course_name }}</p>
          <p><a-icon :component="detail3" /><b>老师：</b>{{ detail.teacher_name }}</p>

          <a-space style="margin-top:6px; min-height: 32px;">
            <a-button v-if="shouldShowEnterLiveButton(detail)" type="primary" ghost
              @click="gotoCourseLive(detail.id)">进入直播间</a-button>
            <template v-if="role !== 'student'">
              <a-button v-if="shouldShowEnterBroadcastutton(detail)" type="primary"
                @click="gotoCourseBroadcast(detail.id)">进入开播</a-button>
            </template>
            <a-button v-if="detail.replay && detail.status === 3" class="greenBtn"
              @click="gotoReplayList(detail.id)">直播回放</a-button>
            <span style="opacity: 0; pointer-events: none;">占位</span>
            <!-- <template v-if="role === 'teacher'">
              <a-button type="info" @click="$refs.createModal.edit(detail)">编辑</a-button>
              <a-button type="danger" @click="removeLiveConfig(detail.id)">删除</a-button>
            </template> -->
          </a-space>
        </div>
        <div class="frame">
          <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
          <img class="play-icon" src="@/assets/icons/play.png" style="width: 32px; height: 32px" />
        </div>

        <div class="flag"
          :style="{ backgroundColor: getStatusColor(detail.status), color: detail.status === 3 ? '#767A8A' : '#fff' }">
          {{
            getStatusText(detail.status) }}
        </div>
      </div>
    </div>
    <a-pagination style="text-align:right;margin-top:20px;" v-bind="pagination" @change="paginationChangeHandler" />

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
import { detail1, detail2, detail3 } from "@/core/icons";

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
      detail1,
      detail2,
      detail3,
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
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `共 ${total} 条数据`,
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
      return this.queryField.status.list.find(el => el.value == s)?.label || "";
    },
    /**
     * 获取直播状态对应的颜色
     * @param {number} s - 状态值，取值范围：
     * 0: 未开始
     * 1: 正在直播
     * 2: 直播准备
     * 3: 已结束
     * @returns {string} 状态对应的颜色
     */
    getStatusColor(s) {
      return ["#1890FF", "#52c41a", "#---", "#E9EBF1"][s] || "#87d068";
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
.table-container {
  width: 100%;
  display: grid;
  gap: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.tableItem {
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid #E9EBF1;
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0px 8px 24px 0px rgba(46, 93, 209, 0.08), 0px 8px 16px 0px rgba(46, 93, 209, 0.04);

  &:hover {
    box-shadow: 0px 8px 24px 0px rgba(46, 93, 209, 0.12), 0px 8px 16px 0px rgba(46, 93, 209, 0.08);
  }

  p {
    margin-bottom: 0.3em;
    display: flex;
    align-items: center;

    .anticon {
      margin-right: 8px;
      font-size: 18px;
      vertical-align: middle;
    }
  }

  .flag {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    border-radius: ~"28% 0 0 0 / 120% 0 0 0";
    padding: 2px 20px;
  }

  .content {
    flex: 1;
    margin-right: 16px;
    min-width: 0;

    p:first-child {
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      color: #111111;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p:not(:first-child) {
      font-size: 14px;
      font-weight: normal;
      line-height: 22px;
      color: #111111;

      b,
      .anticon {
        font-weight: normal;
        color: #565D69;
      }

      b {
        text-wrap: nowrap;
      }
    }
  }

  .frame {
    flex: 0 0 auto;
    width: 202px;
    height: 114px;
    text-align: center;
    position: relative;
    overflow: hidden;
    background-color: #f0f0f0;
    border-radius: 6px;

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
    }
  }
}

.greenBtn {
  // background-color: #52c41a;
  background-color: #fff;
  border-color: #52c41a;
  color: #52c41a;

  &:hover {
    // background-color: #73d13d;
    background-color: #fff;
    border-color: #73d13d;
    color: #73d13d;
  }
}
</style>
