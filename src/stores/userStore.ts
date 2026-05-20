import { defineStore } from "pinia";
import { computed, ref } from 'vue';
import type { User } from "@/types";
import axios from "axios";

import { useRouter } from "vue-router";

export const useUser = defineStore('user', () => {
    const users = ref<User[]>([]); // users 先假設是我們後端所存的使用者資料，讓登入跟這個 list 去做比較，如果登入的 id 和 password 
    const currentUser = ref<User>(); // 紀錄目前登入的 users

    const isLoggedIn = computed(() => {
        return !!currentUser.value;
    })

    const isAdmin = computed(() => {
        return !!(currentUser.value?.role === 'admin')
    })

    async function fetchUsers(){
        const usersData = await axios.get('/api/v1/users');
        users.value = usersData.data;
    }

    // 這邊使用 users 來模擬後端處理資料驗證的流程
    // 這邊先簡單檢查 users 裡面是否有輸入的 使用者ID 和 密碼
    function login(userId: string, password: string) {    
        const loginUser = users.value.find( (user) => user.id === userId && user.password === password)
        if (loginUser) {
            currentUser.value = loginUser;
            console.log('登入成功');
            return true;
            // console.log(currentUser.value);
            // console.log(isLoggedIn.value);
            // console.log(isAdmin.value);
        }else {
            console.log('登入失敗，沒有在使用者列表中');
            return false;
        }
    }

    // 簡單模擬 登出
    function logout(): void {
        currentUser.value = undefined;
        
    }

    

    return {users, fetchUsers, login, logout, currentUser, isLoggedIn, isAdmin};
})