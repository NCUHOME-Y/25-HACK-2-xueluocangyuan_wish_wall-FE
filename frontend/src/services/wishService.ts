import apiClient from "./apiClient";

//许愿内容类型
export interface Wish{
    id: number;
    content: string;
    isPublic: boolean;
    tags: string[];
    likeCount: number;
    commentCount: number;
    createdAt: string;
}

// 后端 data 里包含列表与分页信息的结构
interface WishListData {
  wishes: Wish[];
  page: number;
  pageSize: number;
  total: number;
}

//获取许愿列表的响应体类型
interface WishListResponse{
    wishes: Wish[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    }
}
//api响应体类型
interface ApiResponse<T> {
    code: number;
    msg: string;
    data: T;
}

//获取个人许愿列表
export const getMyWishes = async(
    page: number=1,
    pageSize: number=20
):Promise<WishListResponse> => {
    //apiClient自动附加Token
    //响应体已经过拦截器处理，直接返回data字段
    const res = await apiClient.get<ApiResponse<WishListData>>("/wishes/me",{
        params: {
            page,
            pageSize
        }
    });
const { wishes, page: p, pageSize: s, total } = res.data.data;
  return {
    wishes,
    pagination: {
      page: p,
      pageSize: s,
      total,
      hasMore: p * s < total,
    },
  };
};

import { authService } from './authService';
//统一导出
export const services = {
  authService,
  getMyWishes,
  };