// 头像资源映射工具，统一通过本地静态资源 ID -> URL
const modules = import.meta.glob('/src/assets/images/头像*.svg', { eager: true, as: 'url' }) as Record<string, string>;
const map: Record<number, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/头像(\d+)\.svg$/);
  if (m) {
    const id = Number(m[1]);
    if (!Number.isNaN(id)) map[id] = url;
  }
}
const defaultAvatar = modules['/src/assets/images/头像1.svg'] || Object.values(modules)[0] || '';
export const getAvatarUrl = (id: number): string => map[id] || defaultAvatar;
export const allAvatarIds = Object.keys(map).map(Number);
