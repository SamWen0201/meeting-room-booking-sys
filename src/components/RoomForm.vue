<script setup lang="ts">
import { ref, reactive } from "vue";

// stores
import { useRoomList } from "@/stores/roomList";

const roomListStore = useRoomList();

// bookingForm state
const name = ref("");
const capacity = ref(10);
const equipments = ref([]);

const roomAddForm = reactive({
  name,
  capacity,
  equipments
})

function addRoom():void {
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

  
}

function roomFormIsValid(): boolean {
  if (name.value === "" || (capacity.value < 0 && typeof capacity.value !== "number")) {
    return false;
  }
  return true;
}

// define closeDialog emits
const emit = defineEmits(['closeDialoagRoomForm']);


</script>
<template>
  <el-form :model="roomAddForm" label-position="top">
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
        <el-button type="primary" @click="addRoom">確認新增</el-button>
      </div>
    </el-form-item>
  </el-form>

  <!-- my form -->
  <!-- <form action="#" @submit.prevent="addRoom">
    <label for="name">會議室名稱:</label>
    <input v-model="name" id="name" required/>
    <label for="capacity">容納人數:</label>
    <input type="number" min="0" v-model.number="capacity" id="capacity" required/>

    <div>設備:</div>
    <input
      type="checkbox"
      v-model="equipments"
      value="白板"
      id="whiteboard"
    />
    <label for="whiteboard">白板</label>
    <input
      type="checkbox"
      v-model="equipments"
      value="投影機"
      id="projecter"
    />
    <label for="projecter">投影機</label>
    <input type="checkbox" v-model="equipments" value="雷射筆" id="pen" />
    <label for="pen">雷射筆</label>

    <button>確認新增</button>
  </form> -->
</template>
