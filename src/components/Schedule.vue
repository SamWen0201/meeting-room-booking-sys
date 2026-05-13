<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoomList } from "@/stores/roomList";
import { useBookingList } from "@/stores/bookingListStore";
import type { RoomTimeLine } from "@/types";
import type { Booking } from "@/types";
const useRoomListStore = useRoomList();
const useBookingListStore = useBookingList();

const today = ref("");

// 先計算一天 9:00-18:00 之間可以分為多少 30分鐘
function calculateTimeBlock(
  [startTime, endTime]: string[],
  blockTime: number = 30,
): number {
  const [startTimeHour, startTimeMinute] = startTime
    ?.split(":")
    .map(Number) as [number, number];
  const [endTimeHour, endTimeMinute] = endTime?.split(":").map(Number) as [
    number,
    number,
  ];

  return (
    (endTimeHour * 60 +
      endTimeMinute -
      (startTimeHour * 60 + startTimeMinute)) /
    blockTime
  );
}

const roomTimeLines = ref<RoomTimeLine[]>([]);

onMounted(() => {
  // 初始化 roomTimeLines state
  roomTimeLines.value = useRoomListStore.rooms.map((el) => {
    const roomIsUsingArrLength = calculateTimeBlock(["9:00", "18:00"]);
    const roomIsUsingArr: boolean[] = new Array(roomIsUsingArrLength).fill(
      false,
    );

    return {
      roomId: el.id,
      roomIsUsingArr,
    };
  });
});

// 根據 Schedule 的 today state 來決定 roomIsUsingArr  各元素的 truthy value
// 1. 先獲得今天的 預約紀錄 -> 今天 + 1 天，怎麼去找到屬於這一天的紀錄
//
const todayBookings = computed<Booking[]>(() => {
  // 將預約紀錄的日期等於今天日期的所有預約紀錄計算出來
  return useBookingListStore.bookings.filter((el) => {
    const bookingDate = new Date(el.startTime);
    const todayDate = new Date(today.value);

    const bookingYear = bookingDate.getFullYear();
    const bookingMonth = bookingDate.getMonth();
    const bookingDay = bookingDate.getDate();

    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    const todayDay = todayDate.getDate();

    return bookingYear === todayYear &&
      bookingMonth === todayMonth &&
      bookingDay === todayDay
      ? true
      : false;
  });
});

// booking 中的 startTime and endTime 要能夠讓 roomTimeLines 中的屬性 roomIsUsingArr 中對應的陣列設定 truthy value
// 假設 9:00 - 9:30 代表 roomIsUsingArr[0] = truth
// (bookingStart - todayDate)= 開始時間多出來的 30n 分鐘 n 就會是 roomIsUsingArr 的索引值為 true 的元素？
// (bookingEnd - bookingStart) / blockTime = 維持的格子數，也就是 由前面一個算式中的 n + 這邊算出來的數值？
// 最後計算出來的元素是第 n ~ n+

// calculateBlockSpan 這個 function 會在 todayBookings 中的 每一個 booking 跑一次
// 造成的 side effect 是修改我們的 roomIsUsingArr 為對應到 startTime, endTime 的 truthy value
function calculateBlockSpan(
  bookingStartTime: number,
  bookingEndTime: number,
): void {}
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
      <el-button type="primary">新增預約</el-button>
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
    <div>
      <ul>
        <li v-for="booking in todayBookings">
          <span
            >測試：今天的預約紀錄：{{ booking.title }}
            {{ booking.userId }}</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>
