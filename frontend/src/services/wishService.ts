
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
// 统一规范化后端字段，兼容 snake_case / 变动字段名
function normalizeWish(raw: any): Wish {
  return {
    id: Number(raw?.id ?? raw?.wishId ?? 0),
    content: String(raw?.content ?? raw?.wishContent ?? ''),
    isPublic: Boolean(raw?.isPublic ?? raw?.public ?? raw?.visibility === 'public'),
    tags: Array.isArray(raw?.tags) ? raw.tags.map((t: any) => String(t)) : [],
    likeCount: Number(raw?.likeCount ?? raw?.like_count ?? raw?.likes ?? 0),
    commentCount: Number(raw?.commentCount ?? raw?.comment_count ?? raw?.comments ?? 0),
    createdAt: String(raw?.createdAt ?? raw?.created_at ?? raw?.create_time ?? new Date().toISOString()),
    nickname: String(raw?.nickname ?? raw?.userNickname ?? raw?.user_name ?? '匿名'),
    avatarId: Number(raw?.avatarId ?? raw?.avatar_id ?? raw?.avatar ?? 0),
    isOwn: Boolean(raw?.isOwn ?? raw?.mine ?? raw?.own ?? false),
  };
}

// 解析列表数据的通用函数
function extractWishArray(data: any): any[] {
  if (!data) return [];
  return (
    data.wishes ||
    data.list ||
    data.records ||
    data.items ||
    []
  );
}

export const getMyWishes = async (
  page: number = 1,
  pageSize: number = 20
): Promise<WishListResponse> => {
  const res = await apiClient.get<ApiResponse<WishListData>, ApiResponse<WishListData>>("/wishes/me", {
    params: { page, pageSize }
  });
  const d: any = res.data || {};
  const rawList = extractWishArray(d);
  const wishes = rawList.filter((w: any) => w && typeof w === 'object').map(normalizeWish);
  const p = Number(d.page ?? d.pageNum ?? d.currentPage ?? page);
  const s = Number(d.pageSize ?? d.size ?? pageSize);
  const total = Number(d.total ?? d.totalCount ?? rawList.length);
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
  const res = await apiClient.get<ApiResponse<WishListData>, ApiResponse<WishListData>>("/wishes/public", {
    params: { page, pageSize }
  });
  const d: any = res.data || {};
  const rawList = extractWishArray(d);
  const wishes = rawList.filter((w: any) => w && typeof w === 'object').map(normalizeWish);
  const p = Number(d.page ?? d.pageNum ?? d.currentPage ?? page);
  const s = Number(d.pageSize ?? d.size ?? pageSize);
  const total = Number(d.total ?? d.totalCount ?? rawList.length);
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
  const data = response.data;
  // 规范 wishInfo（防止字段名不一致导致 likeCount 不刷新）
  if (data?.wishInfo) {
    data.wishInfo = normalizeWish(data.wishInfo as any) as Wish;
  }
  // 规范 comments 结构，兼容多种返回形态，避免前端显示“暂无评论”
  try {
    const raw: any = (data as any) || {};
    let commentsSrc: any = raw.comments ?? raw.commentList ?? raw.comment ?? [];
    // 提取列表
    let rawList: any[] = [];
    if (Array.isArray(commentsSrc)) {
      rawList = commentsSrc;
    } else if (commentsSrc && typeof commentsSrc === 'object') {
      rawList = commentsSrc.list || commentsSrc.records || commentsSrc.items || commentsSrc.data || [];
    }

    const normalizeComment = (c: any): wishComment => ({
      id: Number(c?.id ?? c?.commentId ?? 0),
      userId: Number(c?.userId ?? c?.uid ?? 0),
      userNickname: String(c?.userNickname ?? c?.nickname ?? c?.user_name ?? '匿名用户'),
      userAvatarId: Number(c?.userAvatarId ?? c?.avatarId ?? c?.avatar_id ?? 0),
      wishId: Number(c?.wishId ?? c?.wid ?? wishId),
      likeCount: Number(c?.likeCount ?? c?.like_count ?? 0),
      content: String(c?.content ?? c?.text ?? ''),
      createdAt: String(c?.createdAt ?? c?.created_at ?? c?.create_time ?? new Date().toISOString()),
      isOwn: Boolean(c?.isOwn ?? c?.mine ?? c?.own ?? false),
    });

    const list = rawList
      .filter((c: any) => c && typeof c === 'object')
      .map(normalizeComment);

    const pageNum = Number(commentsSrc?.page ?? commentsSrc?.pageNum ?? commentsSrc?.currentPage ?? 1);
    const pageSize = Number((commentsSrc?.pageSize ?? commentsSrc?.size ?? list.length) || 20);
    const total = Number(commentsSrc?.total ?? commentsSrc?.totalCount ?? list.length);

    (data as any).comments = {
      list,
      pagination: {
        page: pageNum,
        pageSize,
        total,
      },
    } as CommentsInfo;
  } catch (e) {
    // 忽略规范化异常，保持原数据
  }
  return data;
};

// 独立获取某条愿望的评论列表，避免从 interactions 里误读点赞数据
export const getWishComments = async (
  wishId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<CommentsInfo> => {
  const res = await apiClient.get<ApiResponse<any>, ApiResponse<any>>(
    `/wishes/${wishId}/comments`,
    { params: { page, pageSize } }
  );
  const d: any = res.data || {};
  let src: any = d.comments ?? d.data ?? d;
  let rawList: any[] = [];
  if (Array.isArray(src)) rawList = src;
  else if (src && typeof src === 'object') rawList = src.list || src.records || src.items || src.data || [];

  const normalizeComment = (c: any): wishComment => ({
    id: Number(c?.id ?? c?.commentId ?? 0),
    userId: Number(c?.userId ?? c?.uid ?? 0),
    userNickname: String(c?.userNickname ?? c?.nickname ?? c?.user_name ?? '匿名用户'),
    userAvatarId: Number(c?.userAvatarId ?? c?.avatarId ?? c?.avatar_id ?? 0),
    wishId: Number(c?.wishId ?? c?.wid ?? wishId),
    likeCount: Number(c?.likeCount ?? c?.like_count ?? 0),
    content: String(c?.content ?? c?.text ?? ''),
    createdAt: String(c?.createdAt ?? c?.created_at ?? c?.create_time ?? new Date().toISOString()),
    isOwn: Boolean(c?.isOwn ?? c?.mine ?? c?.own ?? false),
  });

  const list = rawList.filter((c: any) => c && typeof c === 'object').map(normalizeComment);
  const p = Number(src?.page ?? src?.pageNum ?? src?.currentPage ?? page);
  const s = Number((src?.pageSize ?? src?.size ?? list.length) || pageSize);
  const total = Number(src?.total ?? src?.totalCount ?? list.length);
  return {
    list,
    pagination: {
      page: p,
      pageSize: s,
      total,
    }
  };
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
  getWishComments,
};