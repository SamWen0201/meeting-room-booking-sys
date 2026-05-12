import '../mock/index';
import axios from "axios";

export async function testGetMock() {
    const res = await axios.get('/api/v1/rooms');
    return res.data.list;
}

