import { defineStore } from "pinia";
import { ref } from 'vue';
import type { User } from "@/types";
import axios from "axios";

export const useUser = defineStore('user', () => {
    const users = ref<User[]>([]);

    async function fetchUsers(){
        const usersData = await axios.get('/api/v1/users');
        users.value = usersData.data;
    }

    return {users, fetchUsers};
})