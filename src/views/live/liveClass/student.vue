<template>
  <div id="studentLivePage">
    <div class="volcLiveApp">
      <div class="content">
        <div class="menu-top">
          <div id="player" class="player"></div>
          <div id="menu" class="menu"></div>
        </div>
        <div id="menu2" class="menu-bottom"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prepareLivePage } from "@/api/livepage";

export default {
  name: "studentLivePage",
  data() {
    return {
      liveUrl: "",
      liveToken: "",
    };
  },
  computed: {
    liveId() {
      return this.$route.params.liveId;
    },
  },
  mounted() {
    prepareLivePage(this.liveId).then(res => {
      if (res.status) {
        this.$message.error(res.msg || "获取数据失败，请稍后再试。");
        return;
      }
      this.activityId = res.data.activityId;
      this.liveUrl = res.data.liveUrl;
      this.liveToken = res.data.liveToken;

      // 使用mounted而不是created
      this.loadScript()
        .then(() => {
          this.init();
        })
        .catch(err => {
          console.error("Failed to load script:", err);
        });
    });
  },
  methods: {
    loadScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://mediaservice-fe.volccdn.com/obj/vcloud-fe/livesaas-client/pc/js/index.2.1.28.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },
    init() {
      // var url = this.liveUrl;
      var webSDK = new window.ByteLiveWebSDK({
        activityId: this.activityId,
        token: this.liveToken,
        service: "liveDemo",
        mode: 1,
        modules: [
          {
            id: "player", // 接入方页面内的元素ID, 视频模块会嵌入到此元素内
            mode: "player",
          },
          {
            id: "menu",
            mode: "menu",
            // 配置需要显示的菜单类型，如需全部显示则无需配置
            menu: ["comment", "imagetext", "cardlist"],
          },
          {
            id: "menu2",
            mode: "menu",
            menu: ["bandcontent"],
          },
        ],
        options: {
          mobileBackgroundTransparent: true,
          saveUserInfo: true,
        },
      });
      webSDK.on("error", console.log);
    },
  },
};
</script>

<style lang="less" scoped>
#studentLivePage {
  font-size: 10px;
  margin: 0;
  background-color: #080b12;
  height: 100vh;
  .volcLiveApp {
    background-image: url(//p6-live.byteimg.com/tos-cn-i-gjr78lqtd0/faa3e534621e30f31b5fd87bcd31a11d.jpg~tplv-gjr78lqtd0-image.image);
    background-size: 100% auto;
    background-repeat: no-repeat;
    height: 100%;
    width: 100%;

    .content {
      width: 90vw;
      min-width: 972px;
      max-width: 1612px;
      margin: 0 auto;
      padding-top: 150px;
      padding-bottom: 80px;
    }

    .menu-top {
      width: 100%;
      display: flex;
    }

    .player {
      width: calc(90vw - 332px);
      /*播放器的宽高比例建议为 16:9*/
      height: calc((90vw - 332px) / 16 * 9 + 55px);
      min-width: 640px;
      /*播放器最小宽度建议为 640 px*/
      max-width: 1280px;
      min-height: 415px;
      max-height: 775px;
    }
    .menu {
      /*菜单最小宽度建议为 320 px*/
      width: 320px;
      margin-left: 12px;
      height: calc((90vw - 332px) / 16 * 9 + 55px);
      max-height: 775px;
      min-height: 415px;
    }

    .menu-bottom {
      width: 100%;
      margin-top: 12px;
      height: calc(66vw + 100px);
      max-height: 1300px;
      min-height: 800px;
    }
  }
}
</style>
