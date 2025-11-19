<template>
  <div id="broadcastPage">
    <iframe v-if="broadcastUrl" :src="broadcastUrl" width="100%" height="100%" frameborder="0" scrolling="no" allow="microphone;camera;midi;encrypted-media;display-capture;"></iframe>
    <div v-else style="background-color: #fff; padding: 20px">
      <Empty :opt="{ description: errorMsg }" />
    </div>
  </div>
</template>

<script>
import { prepareBroadcast } from "@/api/livepage";
import Empty from "@/components/Empty.vue";
import { mapGetters } from "vuex";

export default {
  name: "broadcast",
  components: { Empty },
  data() {
    return {
      broadcastUrl: "",
      errorMsg: "",
    };
  },
  computed: {
    liveConfigId() {
      return this.$route.params.liveConfigId;
    },
    ...mapGetters(["userInfo"]),
    userId() {
      // 从store中获取用户ID
      return String(this.userInfo.id || "1"); // 转换为字符串类型，默认为"1"
    },
  },
  mounted() {
    prepareBroadcast(this.liveConfigId, this.userId).then(res => {
      if (res.status) {
        this.$message.error(res.msg || "获取数据失败，请稍后再试。");
        this.errorMsg = res.msg || "获取数据失败，请稍后再试。";
        return;
      }
      this.broadcastUrl = res.data;
    });
  },
  methods: {},
};
</script>

<style lang="less" scoped>
#broadcastPage {
  width: 100%;
  height: 80vh;
}
</style>
