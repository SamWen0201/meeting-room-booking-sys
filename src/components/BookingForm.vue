<script setup lang="ts">
import { ref, reactive, watch } from "vue";

import type { Booking } from "@/types";

// import rulesForm instance
import type { FormInstance } from "element-plus";

// import store
import { useRoomList } from "@/stores/roomList";
import { useBookingList } from "@/stores/bookingListStore";

// import notification
import { ElNotification } from 'element-plus'

const useRoomListStore = useRoomList();
const useBookingListStore = useBookingList();

const title = ref<string>("");
const date = ref<Date>(new Date("")); // 預設想要預約的會議日期是今天

const startTime = ref<string>("");
const endTime = ref<string>("");

const roomId = ref<string>("");

const form = reactive({
  title,
  date,
  startTime,
  endTime,
  roomId,
});

const props = defineProps<{
  todayDateInMidNight: Date | null;
  prefilledRoomId: string;
  prefilledStartTime: string;
}>();
// 監聽 props ，如果有值，就將數值填入 BookingForm
watch(() => props.todayDateInMidNight, (val) => {
  if (val) date.value = val; },
  { immediate: true }
)
watch(
  () => props.prefilledRoomId,
  (val) => {
    if (val) roomId.value = val;
  },
  { immediate: true },
);
watch(
  () => props.prefilledStartTime,
  (val) => {
    if (val) startTime.value = val;
  },
  { immediate: true },
);

// 監聽時段的狀態，只要修改時間，會議室的選擇就會 reset
// 因為目前會議室衝突的邏輯是透過 取消 diable 選項達成的，背後的邏輯沒有在提交的時候做攔截
watch ([startTime, endTime], () => {
  roomId.value = '';
})

// handle formRules
const bookingFormRef = ref<FormInstance>();

const formRules = reactive({
  title: [
    { required: true, message: "必須輸入會議主題", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "會議主題長度必須介於 2~50 字",
      trigger: "blur",
    },
  ],
  // date: [
  //   {
  //     type: "date",
  //     required: true,
  //     message: "必須輸入日期",
  //     trigger: "change",
  //   },
  // ],
   date: [
    {
      required: true,
      type: 'date',
      message: '必須輸入日期',
      trigger: "change",
    },
  ],
  startTime: [
    {
      type: "string",
      required: true,
      message: "必須輸入開始時間",
      trigger: "change",
    },
  ],
  endTime: [
    {
      type: "string",
      required: true,
      message: "必須輸入結束時間",
      trigger: "change",
    },
  ],
  roomId: [{ required: true, message: "必須選擇會議室", trigger: "change" }],
});
// function dateValidation(rule: any, value: any, callback: Function): void {
//   if (!value) {
//     callback(new Error('必須輸入日期'));
//   }
// }

function combineDateTime(): Date[] {
  // 思考 combineDateTime 的執行時間，
  // 前面要再做 null 值 和 undefined 值判斷
  // get year, month, day

  const year: number = date.value.getFullYear();
  const month: number = date.value.getMonth(); // month in range 0-11
  const day: number = date.value.getDate(); // 獲得當天幾號

  const [startHour, startMinute] = startTime.value.split(":").map(Number) as [
    number,
    number,
  ];
  const [endHour, endMinute] = endTime.value.split(":").map(Number) as [
    number,
    number,
  ];

  const resultStartTime = new Date(year, month, day, startHour, startMinute);
  const resultEndTime = new Date(year, month, day, endHour, endMinute);

  return [resultStartTime, resultEndTime];
}

async function addBooking(): Promise<void> {
  // 在新增預約紀錄之前，要處理衝突檢測、卡控邏輯
  // 1. 正在被使用的會議室不能預約
  // 2. 最小預約單位為 30 分鐘 -> 也就是只能以 30 60 90 分鐘去預約，不能預約 27 3 45
  // 3. 預約時間必須落在 9:00-18:00(工作時間)
  // 4. 禁止預約過去的時間 (也就是現在)

  // 演算法核心：Existing.Start < New.End AND Existing.End > New.Start。
  // 若上述條件成立，代表時段重疊，該會議室不可選或送出表單時需報錯。

  // 輸入限制：
  // 會議主題：長度限制 2-50 字元。
  // 容納人數：必須為正整數。

  // 增加 el-form 驗證邏輯
  if (!bookingFormRef.value) return;

  await bookingFormRef.value.validate((valid) => {
    if (!valid) {
      console.log("表單驗證失敗");
      return;
    }

    if (!titleIsValid()) {
      // addBooking
      console.log("會議主題必須填寫!");
      return;
    } else if (!durationIsValid()) {
      console.log('會議持續時間必須以30分鐘為單位! 並且開始時間不得大於結束時間!');
    }
    else if (!dateIsValid()) {
      console.log('不能選擇過去的時間，並且選擇的預約時間只能介於 9:00-18:00 之間');
    }else if (!roomId.value) {
      console.log('必須要選擇會議室!');
    } else {
      console.log('表單驗證通過，可以新增!');
      const [bookingStartTime, bookingEndTime] = combineDateTime() as [
        Date,
        Date,
      ];

      const newBooking: Booking = {
        id: crypto.randomUUID(),
        roomId: roomId.value,
        userId: "1",
        title: title.value,
        startTime: bookingStartTime?.getTime(),
        endTime: bookingEndTime?.getTime(),
      };
      useBookingListStore.addBooking(newBooking);

      // remove the input
      roomId.value = "";
      title.value = "";
      startTime.value = "";
      endTime.value = "";

      // closse the dialoa
      ElNotification({
        title: 'Success',
        message: '順利新增'
      })
      emit("closeDialogBookingForm");
    }
  });
}

// 輸入限制：
// 會議主題：長度限制 2-50 字元。
// 容納人數：必須為正整數。
function titleIsValid(): boolean {
  if (title.value.length < 2 || title.value.length > 50) {
    return false;
  } else {
    return true;
  }
}

// 會議開始時間不能大於結束時間
// 會議時間以 30 分鐘為一單位
function durationIsValid(): boolean {
  const [startHour, startMinute] = startTime?.value.split(":").map(Number) as [
    number,
    number,
  ];
  const [endHour, endMinute] = endTime.value?.split(":").map(Number) as [
    number,
    number,
  ];

  // 開始時間不能大於結束時間
  if (startHour > endHour) {
    return false;
  } else if (startHour === endHour && startMinute > endMinute) {
    return false;
  }

  // 時間以 30 分鐘為一單位
  const duration =  (endHour * 60 + endMinute) - startHour * 60 + startMinute;

  if (duration % 30 !== 0) {
    return false;
  }

  return true;
}

// 過去的時間不能預約
// 預約只能介於 9:00-18:00 之間(工作日)
// 未完成: 週六、日是否也要做設定不能預約?
function dateIsValid(): boolean {
  const now = Date.now();
  const [resultStartTime, resultEndTime] = combineDateTime();
  if (resultStartTime === undefined || resultEndTime === undefined) {
    return false;
  }
  // 過去的時間不能預約
  if (resultStartTime.getTime() < now) {
    return false;
  }

  const [startHour, startMinute] = startTime.value.split(":").map(Number) as [
    number,
    number,
  ];
  const [endHour, endMinute] = endTime.value.split(":").map(Number) as [
    number,
    number,
  ];
  // 預約時間只能介於 9:00-18:00 之間
  if (startHour < 9 || endHour > 18) {
    return false;
  }
  return true;
}

function roomIsUsing(roomId: string): boolean {
  // if (!dateIsValid()) {
  //   console.log("日期沒有被正確填寫!，無法判斷該會議室是否有人使用。");
  //   // return false;
  // }
  // if (!durationIsValid()) {
  //   console.log("時段沒有被正確填寫!，無法判斷該會議室是否有人使用。");
  //   // return false;
  // }
  // 該時段正在被使用的會議室不能預約
  // 演算法核心：Existing.Start < New.End AND Existing.End > New.Start。
  // 若上述條件成立，代表時段重疊，該會議室不可選或送出表單時需報錯。

  // 這邊是需要跟當前 BookingForm 使用者選擇的狀態做判斷，既然這樣，選擇會議室的功能是否就要先鎖定，並且等到選擇完時間之後? -> 這邊先不做這個鎖定，我們先只做該時段的會議室 options 不能選擇就好
  // 目前在表格 BookingForm中設定的 日期、開始時間、結束時間
  // 感覺可以直接先找今天的 bookings 就好了嗎?
  // 這邊用 filter 同時去做判斷該 roomId 中

  // bookingsInTheRoom 是該使用該會議室的 預約記錄
  const bookingsInTheRoom: Booking[] = useBookingListStore.bookings.filter(
    (el): boolean => el.roomId === roomId,
  );

  // 在使用該會議室的 多個預約記錄，找到跟 BookingForm 選擇的會議時間段 衝突的紀錄
  const [bookingStartTime, bookingEndTime] = combineDateTime();
  console.log('預約會議起始時間', bookingStartTime);
  console.log('預約會議結束時間', bookingEndTime);

  if (bookingStartTime === undefined || bookingEndTime === undefined) {
    // 這邊只是先暫時處理，之後需要處理 bookingStartTime, bookingEndTime 可能會是 undefined 的問題
    console.log("booking form is not completely");
    return false;
  }
  //
  const conflictBooking = bookingsInTheRoom.find(
    (el) =>
      bookingStartTime.getTime() < el.endTime &&
      bookingEndTime.getTime() > el.startTime,
  );

  if (conflictBooking) {
    console.log(`has Conflictbooking in the room${roomId}! `);
    return true;
  } else {
    console.log(`No Conflictbooking in the room${roomId}! `);
    return false;
  }
}

// emit closeDialogBookingForm events
const emit = defineEmits(["closeDialogBookingForm"]);
</script>
<template>
  <div>
    <el-form
      :model="form"
      :rules="formRules"
      label-position="top"
      ref="bookingFormRef"
      class="bookingform"
    >
      <el-form-item label="會議主題" label-position="top" prop="title">
        <el-input v-model="form.title" :maxlength="50" show-word-limit />
      </el-form-item>

      <el-row>
        <el-col :md="24" :lg="12">
          <el-form-item label="日期" label-position="top" prop="date">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="Pick a day"
            />
          </el-form-item>
        </el-col>

        <el-col :md="24" :lg="12">
          <el-form-item label="時段" label-position="top">
            <el-col :span="11">
              <div class="modify-translate-top">
                <el-form-item prop="startTime">
                  <el-time-select
                    v-model="form.startTime"
                    :max-time="endTime"
                    placeholder="Start time"
                    start="09:00"
                    step="00:30"
                    end="17:30"
                    required
                  />
                </el-form-item>
              </div>
            </el-col>
            <el-col class="text-ceter" :span="1">-</el-col>
            <el-col :span="11">
              <div class="modify-translate-top">
                <el-form-item prop="endTime">
                  <el-time-select
                    v-model="form.endTime"
                    :min-time="startTime"
                    placeholder="End time"
                    :start="startTime"
                    step="00:30"
                    end="18:00"
                    required
                  />
                </el-form-item>
              </div>
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="選擇會議室" prop="roomId">
        <el-select v-model="roomId" placeholder="Select">
          <el-option
            v-for="item in useRoomListStore.rooms"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            :disabled="roomIsUsing(item.id)"
          />
        </el-select>
      </el-form-item>

      <el-form-item label-position="right" label-width="">
        <div class="u-margin-left-auto">
          <el-button @click="$emit('closeDialogBookingForm')">取消</el-button>
          <el-button type="primary" @click="addBooking">確認預約</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<style lang="scss">
// @use "../assets/utilities";
.modify-translate-top {
  transform: translateY(-2.5px);
}
.text-ceter {
  transform: translateX(0.5rem);
}
.bookingform {
  @media only screen and (max-width: 62em) { // 992px
    width: 100%;
  }
}
</style>
