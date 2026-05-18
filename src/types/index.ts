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
    password: string,
    role: "admin" | "employee",
    name: string
    // 有可能還有其他資料... 
}