<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

// stores
import { useRoomList } from "@/stores/roomList";
import type { Room } from "@/types";

// import rulesForm instance
import type { FormInstance } from "element-plus";

const roomListStore = useRoomList();

// bookingForm state
const name = ref("");
const capacity = ref(10);
const equipments = ref<string[]>([]);

const roomAddForm = reactive({
  name,
  capacity,
  equipments
})

const roomFormRef = ref<FormInstance>();

const formRules = reactive({
  name: [
    {required: true, message: '必須輸入會議室名稱', trigger: 'blur'}
  ],
  capacity: [
    {reqired: true, validator: capacityValidation, trigger: 'blur'}
  ],
})
// 嘗試去寫 el-table 的自我較驗
function capacityValidation(rule: any, value: any, callback: Function): void {
  if (!value) {
    callback(new Error('必須輸入容納人數'))
  } else if (!Number.isInteger(Number(value)) || Number(value) < 1) {
    callback(new Error('容納人數必須為正整數'))
  } else {
    callback() // 驗證通過
  }
}

async function addRoom(): Promise<void> {


  // 增基 el-form 驗證邏輯
  if (!roomFormRef.value) return;

  await roomFormRef.value.validate( (valid) => {
    if (!valid) {
      console.log('表單驗證失敗')
      return
    }

    if(roomFormIsValid()) {
      roomListStore.addRoom({
      id: crypto.randomUUID(),
      name: name.value,
      capacity: capacity.value,
      equipments: equipments.value,
    });

      // remove the input
      name.value = "";
      capacity.value = 0;
      equipments.value = [];

      emit('closeDialoagRoomForm');
    }else {
      return;
    }

  })


  
}

function roomFormIsValid(): boolean {
  if (name.value === "" || (capacity.value < 0 && typeof capacity.value !== "number")) {
    return false;
  }
  return true;
}

// define closeDialog emits
const emit = defineEmits(['closeDialoagRoomForm']);

// define props
const props = defineProps<{editData?: Room}>();

// 透過 editData 的值 來決定目前是 新增模式 或 編輯模式
const isEditing = computed<boolean>(() => {
  return props.editData?.id ? true : false;
})
// 將獲得的 porps.editData 填入表格中
function fillInEditData(): void {
  if (isEditing.value) {
    console.log('Edit mode!');
    roomAddForm.name = props.editData?.name || ''; // 先讓 roomAddForm.name 一定會有值，就算是 空值
    roomAddForm.capacity = props.editData?.capacity || 0;
    roomAddForm.equipments = props.editData?.equipments || [];
  }else {
    console.log('Add mode!');
  }
}
// 在 Modal 顯示的當下就呼叫，填滿表格資料
onMounted(() => {
  fillInEditData();
})

// 使用者按下 確認編輯按鈕 則編輯完畢。
function editRoom(): void { 
    if (roomFormIsValid()) {
      roomListStore.rooms.map( (el) => {
        if (el.id === props.editData?.id) {
          el.name = roomAddForm.name;
          el.capacity = roomAddForm.capacity;
          el.equipments = roomAddForm.equipments;
        }
        return el;
      })
       // remove the input
      name.value = "";
      capacity.value = 0;
      equipments.value = [];

      emit('closeDialoagRoomForm');
    }else {
      // 需要再做 notifications
      return;
    }
}

</script>
<template>
  <!-- EDIT FORM -->
  <el-form :model="roomAddForm" label-position="top" v-if="isEditing">
    <el-form-item label="會議室名稱">
      <el-input v-model="roomAddForm.name" />
    </el-form-item>

    <el-form-item label="容納人數">
      <el-input type="number" v-model="roomAddForm.capacity" />
    </el-form-item>

    <el-form-item label="設備">
      <el-checkbox-group v-model="equipments">
        <el-checkbox value="白板" name="equipment">
          白板
        </el-checkbox>
        <el-checkbox value="投影機" name="equipment">
          投影機
        </el-checkbox>
        <el-checkbox value="雷射筆" name="equipment">
          雷射筆
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item>
      <div class="u-margin-left-auto">
        <el-button @click="$emit('closeDialoagRoomForm')">取消</el-button>
        <el-button type="primary" @click="editRoom">確認編輯</el-button>
      </div>
    </el-form-item>
  </el-form>

  <!-- ADD FORM -->
  <el-form :model="roomAddForm" label-position="top" :rules="formRules" ref="roomFormRef" v-else >
    <el-form-item label="會議室名稱" prop="name">
      <el-input v-model="roomAddForm.name" />
    </el-form-item>

    <el-form-item label="容納人數" prop="capacity">
      <el-input type="number" v-model="roomAddForm.capacity" />
    </el-form-item>

    <el-form-item label="設備">
      <el-checkbox-group v-model="equipments">
        <el-checkbox value="白板" name="equipment">
          白板
        </el-checkbox>
        <el-checkbox value="投影機" name="equipment">
          投影機
        </el-checkbox>
        <el-checkbox value="雷射筆" name="equipment">
          雷射筆
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item>
      <div class="u-margin-left-auto">
        <el-button @click="$emit('closeDialoagRoomForm')">取消</el-button>
        <el-button type="primary" @click="addRoom">確認新增</el-button>
      </div>
    </el-form-item>
  </el-form>

</template>
