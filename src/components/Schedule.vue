<script setup lang="ts">
// import componentes
import BookingForm from "./BookingForm.vue";

import { computed, onMounted, ref } from "vue";
import { useRoomList } from "@/stores/roomList";
import { useBookingList } from "@/stores/bookingListStore";
import type { Booking } from "@/types";
const useRoomListStore = useRoomList();
const useBookingListStore = useBookingList();

const today = ref("");
function consoleSelectTime() {
  console.log(new Date(today.value));
}
// 先計算一天 9:00-18:00 之間可以分為多少 30分鐘
// 後來用總共時間計算之後，就不需要這個 function 了
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

// 計算出像是 09:00 10:00 11:00 .... 18:00 這樣的字串陣列提供給時間軸標題 render
// startTime 開始時間以字串 '09:00' 為格式
// endTime 以 '18:00' 當作結束時間
// timeFragmentInMinute:number 是幾分鐘為一個區間，預設為 60 分鐘

// 問題: 這邊最後計算出來會少一個點(因為是透過計算中間的空缺，一定會少 1，
// 這邊先直接將陣列 timeLineHeaderList 長度 + 1 補上 endTime ，之後再去思考該怎麼調整
// 目前又把長度維持原樣，因為這樣下方的時間軸比例跟上方的標題列才會正確
function calculateTimeLineHeaderList(
  startTime: string,
  endTime: string,
  timeFragmentInMinute: number = 60,
): string[] {
  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number) as [
    number,
    number,
  ];
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number) as [
    number,
    number,
  ];

  const timeLineHeaderList: string[] = new Array(
    calculateTimeBlock([startTime, endTime], timeFragmentInMinute),
  ).fill(""); // all element will be ""

  // 先把 小時, 分鐘都算出來
  for (let i = 0; i < timeLineHeaderList.length; i++) {
    let timeHour =
      startTimeHour +
      Math.floor((startTimeMinute + i * timeFragmentInMinute) / 60);
    let timeMinute = (startTimeMinute + i * timeFragmentInMinute) % 60;

    timeLineHeaderList[i] =
      `${timeHour.toString().length < 2 ? 0 : ""}${timeHour}:${timeMinute === 0 ? "00" : timeMinute}`;
  }

  return timeLineHeaderList;
}
const timeHeaderList = calculateTimeLineHeaderList("09:00", "18:00");
console.log(timeHeaderList);

// 根據 Schedule 的 today state 來決定 roomIsUsingArr  各元素的 truthy value
// 1. 先獲得今天的 預約紀錄 -> 今天 + 1 天，怎麼去找到屬於這一天的紀錄
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

// calculateMeetingBlock 這個 function 會在 todayBookings 中的 每一個 booking 跑一次
// calculateMeetingBlock 接收 booking 的 startTime, endTime 並且跟 todayTime 一起計算出 預約記錄的 block 的 css style left 和 width
function calculateMeetingBlock(
  bookingStartTime: number,
  bookingEndTime: number,
  todayTime: number,
  wholeTime: number = 540,
): [string, string] {
  const left = (
    ((bookingStartTime - todayTime) / 1000 / 60 / wholeTime) *
    100
  ).toFixed(3); // 毫秒 / 1000 -> 秒, 秒 / 60 -> 分鐘, 分鐘 / wholeTime 會是
  const width = (
    ((bookingEndTime - bookingStartTime) / 1000 / 60 / wholeTime) *
    100
  ).toFixed(3);

  return [left, width];
}

// 將 booking 中的資料拿出來，並且計算出對應的 left 和 width 數值，回傳物件
function getBlockStyle(booking: Booking): { left: string; width: string } {
  // 這邊在計算今天的 timestamp 的時候，不確定是否還是要使用 ref ，或許可以直接使用 startTime 計算?
  const todayTimeStamp: number =
    new Date(today.value).getTime() + 9 * 60 * 60 * 1000; // 00:00 + 9小時 -> 9:00

  const [left, width] = calculateMeetingBlock(
    booking.startTime,
    booking.endTime,
    todayTimeStamp,
  );
  console.log(`會議開始時間:${new Date(booking.startTime)} 會議結束時間:${new Date(booking.endTime)} 預約會議室:${booking.roomId} 預約會議名稱:${booking.title}/
    \n當天時間:${new Date(todayTimeStamp)}`);

  return {
    left: left + "%",
    width: width + "%",
  };
}

// 隨機給予一個顏色 style 回傳 backgroud-color: color; 其中 color 是一個色碼，比如說 #E77777
const timeBlockColors = [
  "var(--color-primary-blue)",
  "var(--color-sucess)",
  "var(--color-danger)",
];
function generateBackgroundColor(colors: string[]): {
  "background-color": string;
} {
  return {
    "background-color": colors[
      Math.floor(Math.random() * colors.length)
    ] as string,
  };
}

// control dialoag
const dialogBookingFormVisible = ref<boolean>(false);
function closeDialoagBookingForm(): void {
  dialogBookingFormVisible.value = false;
}
</script>

<template>
  <div class="schedule">
    <h2 class="heading-secondary">Schedule</h2>
    <div class="block">
      <el-date-picker
        v-model="today"
        type="date"
        placeholder="Pick a day"
        size="default"
        @change="consoleSelectTime"
      />
      <el-button
        type="primary"
        color="#3B82F6"
        @click="dialogBookingFormVisible = true"
        >新增預約</el-button
      >
    </div>

    <!-- Time line chart -->
    <div class="timeline-chart">
      <div class="timeline-chart__time-block-wrapper">
        <span>Room</span>
        <ul class="timeline-chart__time-block-list">
          <li
            v-for="timeHeader in timeHeaderList"
            class="timeline-chart__time-block-item"
          >
            {{ timeHeader }}
          </li>
        </ul>
      </div>

      <ul class="timeline-chart__room-list">
        <li
          v-for="room in useRoomListStore.rooms"
          class="timeline-chart__room-wrapper"
        >
          <span>{{ room.name }}</span>

          <ul class="timeline-chart__timeline">
            <li
              v-for="booking in todayBookings.filter(
                (el) => el.roomId === room.id,
              )"
            >
              <div
                :style="[
                  generateBackgroundColor(timeBlockColors),
                  getBlockStyle(booking),
                ]"
                class="timeline-chart__time-block"
              >
                {{ booking.title }} {{ booking.userId }}
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- BookingForm -->
    <el-dialog
      v-model="dialogBookingFormVisible"
      title="預約會議室"
      destroy-on-close
    >
      <BookingForm
        @onCloseDialogBookingForm="closeDialoagBookingForm"
      ></BookingForm>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/variables" as *;
.timeline-chart {
  border: 1px solid $color-border;
  ul {
    padding-left: 0;
  }

  // timeline 標題列
  // time-block-wrapper 的 grid-column 數值設定 會跟 room-wrapper 的 grid-column 數值設定相同，為了讓兩者的對齊
  // 剛好兩者的
  &__time-block-wrapper,
  &__room-wrapper {
    display: grid;
    grid-template-columns: 8rem 1fr; // 這邊的 8 rem 等等需要先跟下方的會議室設定相同

    & span {
      grid-column: 1 / 2;
      padding: 0.2rem;
      border-right: 1px solid $color-text-main;
    }
  }
  &__time-block-list {
    list-style-type: none;
    display: flex;
  }
  &__time-block-item {
    background-color: $color-border;
    font-weight: bold;
    width: calc(100% / 9);
    border-right: 1px solid $color-text-main;
  }

  // room 的項目列 / 時間軸
  &__room-list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
  }
  &__timeline {
    list-style-type: none;
    flex: 1 1 auto;
    position: relative;
  }
  &__time-block {
    position: absolute;
    height: 100%; // 先設定為這樣，如果之後有問題再調整
  }
}
</style>
