<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useUser } from "@/stores/userStore";


const route = useRoute();
const router = useRouter();
const userStore = useUser();

function handleLogout() :void {
  userStore.logout();
  router.push('/login');
}

</script>
<template>
  <el-container class="whole-container">
    <el-aside class="aside">
      <nav class="nav">
        <RouterLink to="/" class="nav__link">日程總覽</RouterLink>
        <RouterLink
          to="/room-management"
          class="nav__link"
          v-if="userStore.isAdmin"
        >
          會議室維護
        </RouterLink>
        <el-button class="nav__btn-logout" @click="handleLogout">登出</el-button>
      </nav>
    </el-aside>

    <el-container>
      <el-header class="header">
        <h1 class="heading-primary">{{ route.meta.title }}</h1>
        <span class="user-info">{{ userStore.currentUser?.name }}( {{ userStore.currentUser?.role }} )</span>
      </el-header>
      <el-main class="main">
        <!-- 子路由的頁面內容會渲染在這裡 -->
        <RouterView></RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
@use "@/assets/variables" as *;

.aside {
  background-color: $color-slidebar;
  height: 100vh;
  width: 24rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  font-size: $font-size-section;
  padding: $spacing-md;
  height: 100%;

  &__link {
    color: $color-border;
    text-decoration: none;
    transition: all 0.3s;
    border-radius: 2px;
    padding: $spacing-xs;

    &.router-link-exact-active {
      background-color: $color-primary-blue;
      transform: scale(1.05);
    }
  }

  &__btn-logout {
    margin-top: auto;
  }
}

.header {
  padding: $spacing-lg;
  height: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-info {
  font-size: $font-size-section;
  font-weight: $font-weight-section;
  color: $color-text-main;
}

@media (max-width: 75em) {
  .whole-container {
    display: flex;
    flex-direction: column;
  }

  .aside {
    height: auto;
    width: 100%;
  }

  .nav {
    flex-direction: row;

    &__btn-logout {
      margin: none;
      margin-left: auto;
    }
  }
}
</style>