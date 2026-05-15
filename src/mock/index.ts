import type { Booking, Room, User } from "@/types";
import Mock from "mockjs";

// mock data
const rooms: Room[] = [
  {
    id: "1",
    name: "會議室A",
    capacity: 6,
    equipments: ["白板", "投影機"],
  },
  {
    id: "2",
    name: "大會議室",
    capacity: 10,
    equipments: ["投影機"],
  },
  {
    id: "3",
    name: "中型會議室A",
    capacity: 8,
    equipments: ["雷射筆"],
  },
];

const bookings: Booking[] = [
  {
    id: "1",
    roomId: "1", // 關聯的會議室 id
    userId: "1", // 借閱人 id
    title: "晨間會議", // 會議主題
    startTime: 1800406800000, // 2027, 1, 20, 9
    endTime: 1800415800000, // 2027, 1, 20, 11, 30
  },
  {
    id: "2",
    roomId: "3", // 關聯的會議室 id
    userId: "2", // 借閱人 id
    title: "全員大會", // 會議主題
    startTime: 1801364400000, // 2027, 12, 31, 11
    endTime: 1801368000000, // 2027, 12, 31, 12
  },
  {
    id: "3",
    roomId: "2",
    userId: "1",
    title: "臨時動議A",
    startTime: 1778652000000,
    endTime: 1778657400000,
  },
  {
    id: "4",
    roomId: "1",
    userId: "1",
    title: "臨時動議B",
    startTime: 1778652000000 + 1800000,
    endTime: 1778657400000 + 1800000,
  },
  {
    id: "5",
    roomId: "3",
    userId: "1",
    title: "臨時動議C",
    startTime: 1778652000000,
    endTime: 1778657400000,
  },
];

const users: User[] = [
  {
    id: "1",
    role: "admin",
    name: "Sam Wen",
  },
  {
    id: "2",
    role: "normal",
    name: "John Wick",
  },
];

// function

// rooms api
Mock.mock("/api/v1/rooms", "get", () => {
  return rooms;
});

// bookings api
Mock.mock("/api/v1/bookings", "get", () => {
  return bookings;
});
