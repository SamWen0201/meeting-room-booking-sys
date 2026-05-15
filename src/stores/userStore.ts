import { defineStore } from "pinia";
import { ref } from 'vue';
import type { User } from "@/types";

const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([]);

    
})