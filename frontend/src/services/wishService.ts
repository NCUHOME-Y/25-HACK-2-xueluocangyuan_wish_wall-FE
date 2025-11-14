
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
  nickname: string;
  avatarId: number;
  isOwn: boolean; //是否是当前用户的心愿
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
  const res = await apiClient.get<ApiResponse<WishListData>,ApiResponse<WishListData>>("/wishes/me", {
    params: {
      page,
      pageSize
    }
  });
  const { wishes, page: p, pageSize: s, total } = res.data;
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
  const res = await apiClient.get<ApiResponse<WishListData>,ApiResponse<WishListData>>("/wishes/public", {
    params: { 
      page,
      pageSize
    }
  });
  const { wishes, page: p, pageSize: s, total } = res.data;
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
  const res = await apiClient.post<ApiResponse<Wish>,ApiResponse<Wish>>("/wishes", newWishData);
  return res.data;
};

import { authService } from './authService';

// 定义 'POST /api/wishes/{id}/like' 成功后 data 字段的类型
interface LikeWishResponse {
  liked: boolean;
  likeCount: number;
  wishId: number;
}
//点赞功能
// (对应 Apifox 上的 'POST 点赞/取消点赞愿望')
export const likeWish = async (wishId: number): Promise<LikeWishResponse> => {
  const response = await apiClient.post<ApiResponse<LikeWishResponse>,ApiResponse<LikeWishResponse>>(
    `/wishes/${wishId}/like`
    // 这个 POST 请求不需要 body
  );
  // 拦截器已处理错误，这里是成功
  return response.data;
};

//评论功能

// 定义 'POST /api/wishes/{id}/comments' 时发送的数据类型
interface AddCommentPayload {
  content: string;
}

// 定义 'POST 评论愿望' 成功后 data 字段的类型
export interface wishComment {
  id: number;
  userId: number;
  userNickname: string;
  userAvatarId: number;
  wishId: number;
  likeCount: number;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

// (对应 Apifox 上的 'POST 评论愿望')
export const addComment = async (
  wishId: number,
  content: string
): Promise<wishComment> => {

  const payload: AddCommentPayload = { content };

  const response = await apiClient.post<ApiResponse<wishComment>,ApiResponse<wishComment>>(
    `/wishes/${wishId}/comment`,
    payload
  );

  return response.data; // 返回新创建的评论
};

// 删除心愿功能
// (对应 Apifox 上的 'DEL 删除指定ID的愿望')
export const deleteWish = async (wishId: number): Promise<void> => {

  await apiClient.delete<ApiResponse<{}>>(
    `/wishes/${wishId}`
  );
  // 如果代码能走到这里，说明删除成功了
  return;
};
//删除评论
export const deleteComment = async (commentId: number): Promise<void> => {

  await apiClient.delete<ApiResponse<{}>>(
    `/comments/${commentId}`
  );
  //一样
  return;
};
//获取某条愿望的评论和点赞
// 定义点赞着信息
interface Liker {
  userId: number;
  nickname: string;
  avatarId: number;
  likedAt: string;
}
// 定义点赞信息
interface LikesInfo {
  totalCount: number;
  userList: Liker[];
  currentUserLiked: boolean;
}
// 定义分页信息类型
interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

// 定义评论信息类型
interface CommentsInfo {
  list: wishComment[];
  pagination: PaginationInfo;
}

// 定义完整评论响应体类型
interface WishInteractionsResponse {
  wishInfo: Wish; 
  likes: LikesInfo;    
  comments: CommentsInfo; 
}


//获取评论和点赞功能实现
export const getWishInteractions = async (
  wishId: number
): Promise<WishInteractionsResponse> => {
  
  const response = await apiClient.get<ApiResponse<WishInteractionsResponse>, ApiResponse<WishInteractionsResponse>>(
    `/wishes/${wishId}/interactions`
  );
  
  return response.data;
};

//统一导出
export const services = {
  authService,
  getMyWishes,
  createWish,
  getPublicWishes,
  likeWish,
  addComment,
  deleteWish,
  deleteComment,
  getWishInteractions,
};