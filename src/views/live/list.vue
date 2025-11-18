<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <div class="table-page-search-wrapper">
      <!-- 搜索功能 -->
      <SearchForm :queryField="queryField" :queryParam="queryParam" @queryFilter="queryFilter" @clearQuery="clearQuery"></SearchForm>
    </div>
    <div style="padding-bottom: 12px">
      <a-button type="primary" @click="$refs.createModal.add()">新建直播</a-button>
    </div>

    <Empty v-if="!tableList.length" />
    <div v-for="(detail, index) in tableList" class="tableItem">
      <div class="frame">
        <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
        <a-icon type="play-circle" style="font-size: 50px" />
      </div>
      <div class="content">
        <p style="font-size: 18px">{{ detail.subject }}</p>
        <p><b>相关课程：</b>{{ detail.course_name }}</p>
        <p><b>主持人：</b>{{ detail.teacher_name }}</p>
        <p v-if="detail.repeat">
          <b>直播时间:</b>{{ readFromList(detail.repeat, repeatMap) }}{{ formatTime(detail.start_time, "YYYY-MM-DD HH:mm") }}
          <span style="color: #a1a1a1">下次直播：{{ formatTime(detail.next_start_time, "YYYY-MM-DD HH:mm") }}</span>
        </p>
        <p v-else><b>直播时间:</b>{{ formatTime(detail.start_time) }} - {{ formatTime(detail.end_time) }}</p>

        <a-space>
          <a-button v-if="detail.status === 1" type="primary" @click="gotoCourseLive(detail.id)">进入直播间</a-button>
          <a-button v-if="['直播准备', '正在直播'].indexOf(detail.statusByTime) != -1" type="primary" @click="gotoCourseBroadcast(detail.id)">进入开播</a-button>
          <a-button v-if="detail.replay && detail.status === 3" class="greenBtn" @click="gotoReplayList(detail.id)">直播回放</a-button>

          <template v-if="role === 'teacher'">
            <a-button type="info" @click="$refs.createModal.edit(detail)">编辑</a-button>
            <a-button type="danger" @click="removeLiveConfig(detail.id)">删除</a-button>
          </template>
        </a-space>
      </div>

      <div class="flag">
        <a-button style="color: #fff" :style="{ backgroundColor: getStatusColor(detail.status) }">{{ getStatusText(detail.status) }}</a-button>
        <!-- <a-badge :color="getStatusColor(detail.status)" :text="getStatusText(detail.status)" size="large" /> -->
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
import { fetchLiveList, getLiveMaps, removeLiveConfig } from "@/api/live";
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
        },
        status: {
          type: "select",
          label: "直播状态",
          list: [],
        },
        subject: {
          type: "text", // select
          label: "直播主题",
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
    this.getMaps();
  },
  methods: {
    getMaps() {
      getLiveMaps(["repeat", "liveStatus", "course", "semester"]).then(map => {
        this.repeatMap = map.repeatMap;
        this.queryField.status.list = map.liveStatusMap;
        this.queryField.course_id.list = map.courseMap;
        this.queryField.semester_id.list = map.semesterMap;
      });
    },
    fetch() {
      this.loading = true;
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
            return el;
          });
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(_ => {
          this.loading = false;
        });
    },
    queryFilter() {
      this.listParam.page = 1;
      this.fetch();
    },
    clearQuery() {
      this.listParam.page = 1;
      this.queryParam = {
        semester_id: undefined,
        status: -1,
        subject: undefined,
        start_time: [],
        course_id: undefined,
      };
      this.fetch();
    },
    gotoCourseLive(liveConfigId) {
      this.$router.push({
        name: "watch",
        params: { liveConfigId },
      });
    },
    gotoReplayList(configId) {
      this.$router.push({
        name: "replayList",
        params: { configId },
      });
    },
    gotoCourseBroadcast(liveConfigId) {
      this.$router.push({
        name: "broadcast",
        params: { liveConfigId },
      });
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
      let diffMinutes = role === "teacher" ? -30 : -10;
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
  },
};
</script>

<style lang="less" scope>
.tableItem {
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #dedede;
  display: flex;
  position: relative;
  &:hover {
    box-shadow: 2px 2px 3px #dedede;
  }
  p {
    margin-bottom: 0.3em;
  }
  .flag {
    margin-top: 10px;
    position: absolute;
    right: 0;
    top: 0;
    padding: 0 7px;
  }
  .frame {
    flex: 0 0 auto;
    width: 200px;
    height: 140px;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin-right: 10px;
    background-color: #f0f0f0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-color: red;
    }
    .anticon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      cursor: pointer;
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
