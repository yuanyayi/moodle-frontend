<template>
  <span class="editText" @click.self.stop="click" :key="key" :style="_itemStyle">
    <template v-if="!multiMode">
      <a-input
        style="flex: auto"
        v-if="isEdit"
        ref="textarea"
        v-model="editText"
        @keyup.enter.exact="closeEdit"
        @blur="blurHandler"
        :autoFocus="true"
        :style="_inputStyle"
        :placeholder="placeholder"
        :autosize="true" />
      <span :class="isEdit ? 'hidden_this_text' : ''" @click.self.stop="click">
        <slot :style="textStyle" style="flex: auto"> <slot name="addonBefore"></slot>{{ text }}<slot name="addonAfter"></slot> </slot>
      </span>
    </template>
    <template v-else>
      <a-textarea
        style="flex: auto"
        v-if="isEdit"
        ref="textarea"
        v-model="editText"
        @keyup.enter.exact="closeEdit"
        @blur="blurHandler"
        :autoFocus="true"
        :style="_inputStyle"
        :placeholder="placeholder"
        :autosize="true" />
      <span :class="isEdit ? 'hidden_this_text' : ''" @click.self.stop="click">
        <slot :style="textStyle" style="flex: auto"> <slot name="addonBefore"></slot>{{ text }}<slot name="addonAfter"></slot> </slot>
      </span>
    </template>
  </span>
</template>

<script>
export default {
  name: "EditText",
  props: {
    value: { type: String, default: "" },
    inputStyle: { type: Object, default: _ => {} },
    textStyle: { type: Object, default: _ => {} },
    placeholder: { type: String, default: "请输入内容" },
    trigger: { type: String, default: "click" },
    multiMode: { type: Boolean, default: false },
  },
  data() {
    return {
      key: Math.random().toString().slice(3, 11),
      text: "",
      editText: "",
      isEdit: false,
    };
  },
  watch: {
    value: {
      handler: function (val) {
        this.text = val;
      },
      immediate: true,
    },
  },
  computed: {
    _itemStyle: function () {
      let temp = {
        cursor: this.trigger === "click" ? "inherit" : "pointer",
      };
      this.isEdit && (temp.padding = "5px 12px");
      return temp;
    },
    _inputStyle: function () {
      return {
        color: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
        textAlign: "inherit",
        textDecoration: "inherit",
        ...this.inputStyle,
      };
    },
  },
  methods: {
    click() {
      // console.log("this.trigger", this.trigger);
      this.trigger === "click" && this.openEdit();
    },
    openEdit() {
      this.editText = this.text;
      this.isEdit = true;
    },
    closeEdit() {
      if (!this.editText) {
        this.isEdit = true;
      } else {
        this.text = this.editText;
        this.$emit("change", this.text);
        this.isEdit = false;
      }
    },
    blurHandler() {
      this.closeEdit();
    },
  },
};
</script>

<style lang="less" scoped>
.editText {
  display: inline-block;
  min-width: 2em;
  border: 1px solid transparent;
  vertical-align: middle;
  position: relative;
  &:hover {
    border: 1px dashed #a0a0a0;
  }
  .ant-input {
    display: block;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
  .hidden_this_text {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
