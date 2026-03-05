<template>
  <div v-if="visibleItems.length > 0" class="floating-capsule" :class="{ 'is-dragging': isDragging }" :style="capsuleStyle" @mousedown="startDrag">
    <div class="capsule-content">
      <a-tooltip v-for="(item, index) in visibleItems" :key="index" :title="item.title"
        :placement="position.right < windowWidth / 2 ? 'right' : 'left'">
        <div class="capsule-item" @click="handleItemClick(item)">
          <a-badge v-if="item.badge && (typeof item.badge === 'function' ? item.badge() : item.badge)" dot
            :offset="[0, 0]" :numberStyle="{ width: '8px', height: '8px', boxShadow: '0 0 0 1px #fff' }">
            <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
            <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
          </a-badge>
          <template v-else>
            <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
            <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
          </template>
        </div>
      </a-tooltip>
    </div>
    <div class="capsule-drag-handle" title="拖拽移动">
      <a-icon :component="dragIcon" class="drag-icon" />
    </div>
  </div>
</template>

<script>
import { drag } from "@/core/icons";

export default {
  name: 'FloatingCapsule',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDragging: false,
      position: { right: 20, bottom: 0 },
      dragOffset: { x: 0, y: 0 },
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      dragIcon: drag
    }
  },
  computed: {
    capsuleStyle() {
      const style = {
        bottom: `${this.position.bottom}px`,
        right: `${this.position.right}px`,
        zIndex: 999,
        position: 'fixed'
      }
      return style
    },
    visibleItems() {
      return this.items.filter(item => {
        if (typeof item.show === 'function') {
          return item.show()
        }
        return item.show !== false
      })
    }
  },
  created() {
    this.throttledOnDrag = this.throttle(this.onDrag, 16)
  },
  mounted() {
    // 组件挂载后计算初始位置
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
    this.position.right = 20
    this.position.bottom = this.windowHeight / 2
    this.checkPosition()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      this.checkPosition()
    },
    checkPosition() {
      // 检查并限制在屏幕范围内
      const capsuleWidth = 52 // 估算胶囊宽度
      const capsuleHeight = 200 // 估算胶囊高度

      this.position.right = Math.max(0, Math.min(this.position.right, this.windowWidth - capsuleWidth))
      this.position.bottom = Math.max(0, Math.min(this.position.bottom, this.windowHeight - capsuleHeight))
    },
    // 节流函数
    throttle(func, wait) {
      let previous = 0
      return function (...args) {
        const now = Date.now()
        if (now - previous > wait) {
          func.apply(this, args)
          previous = now
        }
      }
    },
    startDrag(e) {
      this.isDragging = true
      // 记录拖拽开始时的鼠标位置
      const startMouseY = e.clientY
      // 记录拖拽开始时的胶囊位置
      const startBottom = this.position.bottom
      
      // 禁用过渡效果，避免拖拽开始时的跳动
      this.$el.style.transition = 'none'

      // 使用requestAnimationFrame实现更平滑的拖拽
      let isDragging = true
      
      const onDrag = (e) => {
        if (!isDragging || !this.isDragging) return
        
        // 计算鼠标移动的距离
        const mouseDelta = e.clientY - startMouseY
        
        // 计算新的bottom位置：鼠标移动多少，胶囊移动多少
        const newBottom = startBottom - mouseDelta
        const capsuleHeight = 200 // 胶囊高度
        
        // 边界检查：确保胶囊完全在屏幕内
        const constrainedBottom = Math.max(0, Math.min(newBottom, this.windowHeight - capsuleHeight))
        
        // 直接更新位置，不进行条件检查，确保拖拽的连续性
        this.position.bottom = constrainedBottom
        
        requestAnimationFrame(() => {
          if (isDragging) {
            onDrag(e)
          }
        })
      }
      
      const stopDrag = () => {
        isDragging = false
        this.isDragging = false
        this.checkPosition()
        
        // 恢复过渡效果
        setTimeout(() => {
          this.$el.style.transition = ''
        }, 100)
        
        document.removeEventListener('mousemove', onDrag)
        document.removeEventListener('mouseup', stopDrag)
        document.removeEventListener('mouseleave', stopDrag)
      }
      
      document.addEventListener('mousemove', onDrag, { passive: false })
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('mouseleave', stopDrag)
      e.preventDefault()
    },
    onDrag(e) {
      // 保留此方法以保持兼容性
      if (!this.isDragging) return

      // 只计算必要的值
      const newBottom = this.windowHeight - e.clientY - this.dragOffset.y
      const capsuleHeight = 200

      // 边界检查
      const constrainedBottom = Math.max(0, Math.min(newBottom, this.windowHeight - capsuleHeight))

      // 只有当位置真正改变时才更新
      if (this.position.bottom !== constrainedBottom) {
        this.position.bottom = constrainedBottom
      }
    },
    // 保留此方法以保持兼容性
    stopDrag() {
      this.isDragging = false
      this.checkPosition()
    },
    handleItemClick(item) {
      if (item.onClick && typeof item.onClick === 'function') {
        item.onClick()
      }
      this.$emit('itemClick', item)
    }
  }
}
</script>

<style lang="less" scoped>
.floating-capsule {
  position: fixed;
  background: rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
  border: 2px solid #fff;
  border-radius: 100px;
  box-shadow: -4px 0px 16px 0px rgba(0, 92, 173, 0.1);
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  z-index: 995;

  &.is-dragging {
    cursor: grabbing;
    box-shadow: -4px 0px 20px 0px rgba(0, 92, 173, 0.2);
  }



  &:hover {
    background-color: #fff;
  }
}

.capsule-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.capsule-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  .item-icon {
    width: 28px;
    height: 28px;
    font-size: 28px;
  }

  .item-icon+.item-icon {
    margin-top: 16px;
  }
}

.capsule-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin-top: 16px;

  &:active {
    cursor: grabbing;
  }

  .drag-icon {
    width: 16px;
    height: 4px;
    fill: #999999;
    font-size: 16px;
  }

  &:hover .drag-icon {
    fill: #666666;
  }
}
</style>
