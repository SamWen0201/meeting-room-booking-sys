export interface Room {
    id: string,
    name: string,
    capacity: number,
    equipments?: string[]
}

export interface Booking {
    id: string,
    roomId: string, // 關聯的會議室 id
    userId: string, // 借閱人 id
    title: string, // 會議主題
    startTime: number, // timestamp
    endTime: number,
    description?: string,

}

export interface User {
    id: string,
    role: "admin" | "normal",
    name: string
    // 有可能還有其他資料... 
}
// 會議室自己擁有的
export interface RoomTimeLine {
    roomId: string, // 會議室 id
    roomIsUsingArr: boolean[], // 這會是一組布林值陣列，假設該 room 在 9:00-9:30 有人使用，則該 room[0] = true
}