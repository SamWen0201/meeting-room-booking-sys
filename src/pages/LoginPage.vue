<script setup lang="ts">
import { reactive } from 'vue';
import { useUser } from '@/stores/userStore';

import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const useUserStore = useUser();

const loginForm = reactive({
    userId: '',
    password: '',
})

function login(): void {
    const success = useUserStore.login(loginForm.userId, loginForm.password);
    if (success) {
        // 有 redirect 就回去原本的頁面，沒有就去首頁
        const redirect = route.query.redirect as string || '/'
        router.push(redirect);
    }
}

</script>
<template>
    <div class="login-container">
        <div class="login-form-container">
            <el-form :model="loginForm"  label-width="auto" class="login-form">
                <el-form-item label="使用者ID" >
                    <el-input v-model="loginForm.userId"/>
                </el-form-item>
                 <el-form-item label="密碼" >
                    <el-input v-model="loginForm.password"/>
                </el-form-item>
                <el-form-item>
                    <el-button class="u-margin-left-auto" type="primary" @click="login">登入</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>  
</template>
<style scoped lang="scss">
@use '../assets/variables' as *;
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
}
.login-form-container {
    padding: $spacing-xl;  
    border: 1px solid $color-border;
    border-radius: 3px;
    box-shadow: 0 1rem 2rem rgba(#000, .15);
}
</style>