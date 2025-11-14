import apiClient from "./apiClient";

//定义从 store 中获取的 User 类型
interface User {
    id: number;
    username: string;
    avatar_id: number;
    nickname: string;
}
//定义api响应体
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
// 定义 'PUT /api/user/me' 接口的 "请求体" 类型
type UpdateUserPayload = Partial<{
  nickname: string;
  avatar_id: number;
}>

// 更新用户信息 (合并了“修改昵称” 和 “更新头像” 两个需求)
export const updateUserProfile = async (
  payload: UpdateUserPayload
): Promise<User> => {

  const res = await apiClient.put<ApiResponse<User>>('/user', payload);

  // 返回更新后的、完整的 User 对象
  return res.data.data;
};


// 统一导出
export const userService = {
  updateUserProfile,
};