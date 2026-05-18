<script setup lang="ts">
// import componentes
import BookingForm from "./BookingForm.vue";

import { computed, onMounted, ref } from "vue";
import { useRoomList } from "@/stores/roomList";
import { useBookingList } from "@/stores/bookingListStore";

// import type
import type { Booking, Room } from "@/types";
import { useUser } from "@/stores/userStore";
import type { TableColumnCtx } from "element-plus";

const useRoomListStore = useRoomList();
const useBookingListStore = useBookingList();
const useUserStore = useUser();

const today = ref("");

// 計算出今天的 00:00 分，該值要被傳入 BookingForm
const todayDateInMidNight = computed(() => {
  const todayDate = new Date(today.value);
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const day = todayDate.getDate();

  return today.value ? new Date(year, month, day) : null;
});

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

// getUserName 獲得 booking.userId 對應的 userName
// 用來顯示在 時間段的上面
function getUserName(userId: string): string {
  return useUserStore.users.find((el) => el.id === userId)!.name;
}

// --- 目前渲染時間軸的方法(使用 list 和 position) ----
// 是透過計算 bookingStartTime - todayTime 的 差 -> 這個差我們會將他除以總時間(540分鐘)
// 所以這個值(百分比) 就會是 時間段的起始點 和 左側標題列 的 起始位置差。
// 我們在下一個函式 getBlockStyle 會將時間段Block 的 css left值 設為該值

// 而時間段的長度，透過 bookingStartTime - bookingEndTime 的差 -> 同樣除以總時間(540分鐘)
// 這個值(百分比) 會是 時間段的寬度在下一個函式 getBlockStyle 會將時間段Block 的 css width值 設為該值。

// --- ---

// calculateMeetingBlock 這個 function 會在 todayBookings 中的 每一個 booking 跑一次
// calculateMeetingBlock 接收單個 booking 的 startTime, endTime 並且跟 todayTime
// 最後計算出 預約記錄的 block 的 css style left 和 width
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
  // console.log(`會議開始時間:${new Date(booking.startTime)} 會議結束時間:${new Date(booking.endTime)} 預約會議室:${booking.roomId} 預約會議名稱:${booking.title}/
  //   \n當天時間:${new Date(todayTimeStamp)}`);

  return {
    left: left + "%",
    width: width + "%",
  };
}

// 隨機給予一個顏色 style 回傳 backgroud-color: color; 其中 color 是一個色碼，比如說 #E77777
const timeBlockColors = [
  "var(--color-timeline-primary-blue)",
  "var(--color-timeline-sucess)",
  "var(--color-timeline-danger)",
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

// getTimeBlockInfo(booking: Booking) 獲得當前 time block 的詳細資訊:包含 會議主題、開始時間到結束時間、會議時長、預約人
function getTimeBlockInfo(booking: Booking) {
  const startTimeHour: number = new Date(booking.startTime).getHours();
  const startTimeMinute: number = new Date(booking.startTime).getMinutes();

  const durationHour: number = Math.floor(
    (booking.endTime - booking.startTime) / 1000 / 60 / 60,
  );
  const durationMinute: number =
    ((booking.endTime - booking.startTime) / 1000 / 60) % 60;

  return `會議主題:${booking.title}, 預約人:${getUserName(booking.userId)},
   開始時間:${startTimeHour}:${startTimeMinute ? startTimeMinute : "00"},
   會議時長:${durationHour}時${durationMinute}分鐘,`;
}

// control dialoag
const dialogBookingFormVisible = ref<boolean>(false);
function handleCloseDialoagBookingForm(): void {
  dialogBookingFormVisible.value = false;
}

function handleTimelineClick(event: MouseEvent, roomId: string): void {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  // 點擊位置換算成分鐘，以 30 分鐘為單位對齊
  const clickPercent = (event.clientX - rect.left) / rect.width;
  const minutesFromStart = Math.floor((clickPercent * 540) / 30) * 30;

  // 換算成時間字串
  const totalMinutes = minutesFromStart + 9 * 60;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const clickedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  // 帶入 BookingForm 的預設時間
  prefilledRoomId.value = roomId;
  prefilledStartTime.value = clickedTime;
  dialogBookingFormVisible.value = true;
}
const prefilledRoomId = ref<string>("");
const prefilledStartTime = ref<string>("");

// -- 另一個渲染時間軸的方法(使用 table?)
// 目前的想法是將 table 和時間段分開處理，先渲染出表格

// 一樣使用 el-table
// 我們建立一個新的 tableData 其中一欄的 column 我們直接給值是 roomListStore.rooms 的名稱？
// 如果 el-column 沒有提供 v-for ，那或許可以採用 js function render template 的方式？

// 我先嘗試將 時間軸表格 畫出來，

// function handleCellClick(
//   row: any,
//   column: TableColumnCtx,
//   cell: HTMLTableCellElement,
//   event: Event,
// ): void {
//   console.log(row, column, cell, event);
//   // column obj 中有一個屬性是 {..., id:'el-table_1_column_2', ...} 代表的是 表格的 第二欄
//   const columnIndex: number = Number(
//     column.id.replace("el-table_1_column_", ""),
//   );
//   // console.log(columnIndex);

//   // 用 欄位當作 timeHeaderList 的陣列索引值，就可以知道點擊的時間段是什麼了。
//   // timeHeaderList[0] = '9:00'
//   // columnIndex -> 欄位 1 顯示會議室名稱，時間段的部分會從欄位 2 開始
//   const timeString: string | undefined = timeHeaderList[columnIndex - 2];
//   // 如果時間段是空白的，那麼直接跳出 新增 預約 Modal ，並且將時間段帶入
//   // 如果時間段有內容，則不會跳出 預約 Modal
// }

// 建立一個 computed value ，其中會有目前的會議室 和他們對應的 today bookings
// {roomId, roomName, bookings: Booking[],}
// const roomsWithTodayBookings = computed(() => {
//   return useRoomListStore.rooms.map((room) => {
//     return {
//       roomId: room.id,
//       roomName: room.name,
//       bookings: todayBookings.value.filter(
//         (booking) => room.id === booking.roomId,
//       ),
//     };
//   });
// });

// 計算出該時段是否有 Booking -> 想想看我要計算出有 Booking
// 從 bookings 中 每一個 booking.startTime 去過濾，如果其中的 Hours 是有跟 時間段的時重疊的，
// 不只要從獲得 預約紀錄的開始時間，然後再透過 結束時間 - 開始時間獲得 時長
// 然後接下的幾格都會具有
// 以目前 table 的狀況可以先視為這一格是 有預約紀錄的
// 等 style 的時候可以將 9:30 這樣的時間移動，
// 我只要算開始時間就好了，因為我之後會將格子根據會議時間延長
// 但是這樣要怎麼避免目前的格子 點擊是確保不會跳出預約 Modal 的，所以還是需要計算出該格子目前有沒有
// 我使用 event prevent bubble ？ 然後將 div 的 position 設高？

// 一個做法是先將所有預約有會議的時間計算成一個陣列 比如說 9:00-10:00 有會議，代表會是 [true, true, ...]
// 但是這樣其中假設是 9:00-10:30 我的陣列就不知道要怎麼設計了。
// function hasBooking(
//   row: {
//     roomId: string;
//     name: string;
//     bookings: Booking[];
//   },
//   columnIndex: number,
// ): boolean {}

// // 會回傳預約有預約紀錄的 style
// function getTimeBlockStyle(): {} | void {}
</script>

<template>
  <div class="schedule">
    <div class="date-picker-wrapper">
      <el-row justify="space-between">
        <el-date-picker
          v-model="today"
          type="date"
          placeholder="選擇日期"
          size="default"
        />
        <el-button
          type="primary"
          color="#3B82F6"
          @click="dialogBookingFormVisible = true"
        >
          <span class="u-margin-right-sm u-flex-center">
            <el-icon><Plus /></el-icon>
          </span>
          新增預約
        </el-button>
      </el-row>
    </div>

    <!-- method 1: 使用 ul 搭配 position  -->
    <!-- Time line chart -->
    <div class="timeline-chart">
      <div class="timeline-chart__time-block-wrapper">
        <span class="timeline-chart__time-block-title">Room</span>
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
          <span class="timeline-chart__timeline-title">{{ room.name }}</span>

          <ul
            class="timeline-chart__timeline-list"
            @click="handleTimelineClick($event, room.id)"
          >
            <li
              v-for="booking in todayBookings.filter(
                (el) => el.roomId === room.id,
              )"
              class="timeline-chart__timeline-item"
            >
              <!-- timeline-chart__time-block 為顯示預約會議時間段和文字的內容 -->
              <el-tooltip
                effect="dark"
                placement="bottom"
                :content="getTimeBlockInfo(booking)"
              >
                <div
                  :style="[
                    generateBackgroundColor(timeBlockColors),
                    getBlockStyle(booking),
                  ]"
                  class="timeline-chart__time-block"
                >
                  <span class="timeline-chart__time-block-text">
                    {{ booking.title }} {{ getUserName(booking.userId) }}
                  </span>
                </div>
              </el-tooltip>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- method 2: 使用 table -->
    <!-- <el-table
      :data="roomsWithTodayBookings"
      border
      @cell-click="handleCellClick"
      class="time-table"
    >
      <el-table-column prop="roomName" label="Room"></el-table-column>
      <el-table-column
        v-for="(timeHeader, index) in timeHeaderList"
        :label="timeHeader"
      >
        <template #default="scope">
          <div
            class="time-table__time-block"
            v-if="hasBooking(scope.row, index)"
          >
            有預約
          </div>
        </template>
      </el-table-column>
    </el-table> -->

    <!-- BookingForm -->
    <el-dialog
      v-model="dialogBookingFormVisible"
      title="預約會議室"
      destroy-on-close
    >
      <BookingForm
        @closeDialogBookingForm="handleCloseDialoagBookingForm"
        :todayDateInMidNight="todayDateInMidNight"
        :prefilledRoomId="prefilledRoomId"
        :prefilledStartTime="prefilledStartTime"
      ></BookingForm>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/variables" as *;

.schedule {
  background-color: #fff;
  padding: $spacing-md;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(#000, 0.3);
  font-size: $font-size-body;
}
// DATE PICKER
.date-picker-wrapper {
  margin-bottom: $spacing-md;
}

// TIME CHART
.timeline-chart {
  border: 1px solid $color-border;
  // border-top: none;
  border-radius: 3px;
  cursor: pointer;
  ul {
    padding-left: 0;
  }

  // timeline 標題列
  // time-block-wrapper 的 grid-column 數值設定 會跟 room-wrapper 的 grid-column 數值設定相同，為了讓兩者的對齊
  // 剛好兩者的
  &__time-block-wrapper,
  &__room-wrapper {
    display: grid;
    grid-template-columns: minmax(10rem, min-content) 1fr; // 這邊的 8 rem 等等需要先跟下方的會議室設定相同

    & span {
      grid-column: 1 / 2;
      padding: $spacing-xs;
      // border-right: 1px solid $color-text-main;
    }
  }
  // 幫 room 加上 border-top 和 border-bottom
  &__room-wrapper {
    border-bottom: 1px solid $color-border;
    &:first-child {
      // border-top: 1px solid $color-border;
    }
  }

  // 標題列
  &__time-block-title {
    background-color: $color-border;
    border-right: 1px solid $color-text-main;
  }
  &__time-block-list {
    list-style-type: none;
    display: flex;
  }
  &__time-block-item {
    background-color: $color-border;
    font-weight: bold;
    width: calc(100% / 9);
    // &:not(:last-child) {
    //   border-right: 1px solid $color-text-main;
    // }
    // padding-left: $spacing-md;
  }

  // room 的項目列 / 時間軸
  &__room-list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
  }
  &__timeline-title {
    border-right: 1px solid $color-text-main;
  }
  &__timeline-list {
    list-style-type: none;
    flex: 1 1 auto;
    position: relative;

    background-image: repeating-linear-gradient(
      to right,
      $color-border,
      $color-border 1px,
      transparent 1px,
      transparent calc(100% / 9)
    );
  }
  &__timeline-item {
    display: flex;
  }
  &__time-block {
    position: absolute;
    height: 100%; // 先設定為這樣，如果之後有問題再調整
    transform: scaleY(0.9);
    // 先設定字體大小為比較小
    font-weight: $font-weight-title;
    color: $color-text-main;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    &:hover {
      cursor: pointer;
    }
  }
  &__time-block-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

// method 2: time-table
.time-table {
  cursor: pointer;

  &__time-block {
  }
}
</style>
