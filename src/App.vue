<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

export default {
  data () {
    return {
    }
  },
  computed: {
    locale () {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

      // 获取当前语言的antd配置，如果获取不到则使用中文作为默认值
      const antLocale = this.$i18n.getLocaleMessage(this.$store.getters.lang)?.antLocale;
      return antLocale || zhCN;
    }
  }
}
</script>