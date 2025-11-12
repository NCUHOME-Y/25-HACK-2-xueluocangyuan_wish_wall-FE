import apiClient from "./apiClient";

//许愿内容类型
export interface Wish {
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
interface WishListResponse {
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
export const getMyWishes = async (
  page: number = 1,
  pageSize: number = 20
): Promise<WishListResponse> => {
  //apiClient自动附加Token
  //响应体已经过拦截器处理，直接返回data字段
  const res = await apiClient.get<ApiResponse<WishListData>>("/wishes/me", {
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
//获取公开许愿列表
export const getPublicWishes = async (
  page: number = 1,
  pageSize: number = 20
): Promise<WishListResponse> => {
  const res = await apiClient.get<ApiResponse<WishListData>>("/wishes/public", {
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
//发布心愿功能
//定义发布心愿时发送给后端的数据类型
interface NewWishData {
  content: string;
  isPublic: boolean;
  tags: string[];
}

export const createWish = async (
  content: string,
  isPublic: boolean,
  tags: string[]
): Promise<Wish> => {
  //准备要发送的数据
  const newWishData: NewWishData = {
    content: content,
    isPublic: isPublic,
    tags: tags,
  };
  //调用api
  const res = await apiClient.post<ApiResponse<Wish>>("/wishes", newWishData);
  return res.data.data;
};

import { authService } from './authService';
//统一导出
export const services = {
  authService,
  getMyWishes,
  createWish,
  getPublicWishes,
};