<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoomList } from "@/stores/roomList";
import { useBookingList } from "@/stores/bookingListStore";
import type { RoomTimeLine } from "@/types";
const useRoomListStore = useRoomList();
const useBookingListStore = useBookingList();

const today = ref("");

// 先計算一天 9:00-18:00 之間可以分為多少 30分鐘
function calculateTimeBlock([startTime, endTime]: string[], blockTime: number = 30): number {
    const [startTimeHour, startTimeMinute] = startTime?.split(":").map(Number) as [number, number];
    const [endTimeHour, endTimeMinute] = endTime?.split(":").map(Number) as [number, number];

    return ((endTimeHour * 60 + endTimeMinute) - (startTimeHour * 60 + startTimeMinute)) / blockTime;
}

const roomTimeLines = ref<RoomTimeLine[]>([]);

onMounted(() => {
    // 初始化 roomTimeLines state
    roomTimeLines.value = useRoomListStore.rooms.map( (el) => {
        const roomIsUsingArrLength = calculateTimeBlock(["9:00" , "18:00"]); 
        const roomIsUsingArr: boolean[] =  new Array(roomIsUsingArrLength).fill(false);

        return {
            roomId: el.id,
            roomIsUsingArr
        }
    })
    
})

// 根據 Schedule 的 today state 來決定 roomIsUsingArr  各元素的 truthy value
// 1. 先獲得今天的 預約紀錄 -> 今天 + 1 天，怎麼去找到屬於這一天的紀錄
const todayBooking = computed(() => {
    // return useBookingListStore.bookings.filter( (el) => )
})




</script>
<template>
    <div class="schedule">
        <h2>Schedule</h2>
        <div class="block">
          <el-date-picker
            v-model="today"
            type="date"
            placeholder="Pick a day"
            size="default"
            @change=""
            :default-time="new Date(Date.now())"
          />
        </div>
        <div class="timeline-chart">
            <ul>
                <li v-for="room in useRoomListStore.rooms">
                    <h3>{{ room.name }}</h3>
                    <ul>
                        <li></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>