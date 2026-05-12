<script setup lang="ts">
import {ref} from "vue"
import type { Booking } from '@/types';

// import store
import { useRoomList } from "@/stores/roomList";
const useRoomListStore = useRoomList();

const title = ref<string>("");
const date = ref<Date>(new Date(2026, 4, 15)); // 預設想要預約的會議日期是今天
// duration 用來儲存時段
const duration = ref<[Date, Date]>([
  new Date(2026, 4, 15, 10),
  new Date(2016, 4, 15, 11, 30),
])
const roomName = ref<string>("");



function combineDateTime(): Date[] {
    const year = date.value.getFullYear();
    const month = date.value.getMonth(); // month in range 0-11
    const day = date.value.getDate(); // 獲得當天幾號

    console.log(year, month, day);   

    const startTime = new Date(year, month, day, duration.value[0].getHours(), duration.value[0].getMinutes());
    const endTime = new Date(year, month, day, duration.value[1].getHours(), duration.value[1].getMinutes());

    console.log(startTime);
    console.log(endTime);
    return [startTime, endTime];
}

function cancelBooking(): void{}

function addBooking(): void {
    
}


</script>
<template>
    <div>
        <h2>預約會議室</h2>

        <form action="#" @submit.prevent="addBooking">
            <label for="title">會議主題</label>
            <input type="text" id="title" v-model="title" required>
           
            <label for="date">日期</label>
            <el-date-picker
                v-model="date"
                type="date"
                placeholder="Pick a day"
            />
           
            <label for="date">時段</label>
            <div class="demo-range">
                <el-time-picker
                    v-model="duration"
                    is-range
                    range-separator="-"
                    start-placeholder="Start time"
                    end-placeholder="End time"
                />
            </div>

            <el-select v-model="roomName" placeholder="Select" style="width: 240px">
                <el-option
                v-for="item in useRoomListStore.rooms"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                />
            </el-select>
            


            <button type="button" @click="cancelBooking">取消</button>
            <button type="button">確認預約</button>

        </form>
    </div>
</template>


