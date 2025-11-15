import { useRef, useEffect, useState, useCallback } from 'react';
import snowflakeImg from '@/assets/images/雪花.svg';
// 定义单条弹幕的数据结构 
export interface DanmuData {
    id: number | string;
    wishContent: string;
    nickName?: string;
    avatar?: number | string;
}

interface WishDanmuProps {
    data: DanmuData;
    baseVelocity?: number; // 正数向右，负数向左
    onDanmuClick: (data: DanmuData) => void;
    onAnimationComplete?: () => void; // 新增：动画完成回调
    trackIndex?: number; // 新增：轨道索引（可选，用于调试）
}

const MAX_CHARS = 10; // 最大显示字数

const WishDanmu = ({
    data,
    baseVelocity = -50, // 默认向左滚动
    onDanmuClick,
    onAnimationComplete,
    //  trackIndex
}: WishDanmuProps) => {
    const { wishContent } = data;
    const displayContent = wishContent.length > MAX_CHARS
        ? wishContent.substring(0, MAX_CHARS) + '...'
        : wishContent;

    const scrollRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const animRef = useRef<number | null>(null);
    const [itemWidth, setItemWidth] = useState(0);

    // 计算单个弹幕项的宽度（不再重复渲染，使用单元素循环）
    useEffect(() => {
        if (scrollRef.current && scrollRef.current.children[0]) {
            const width = (scrollRef.current.children[0] as HTMLElement).offsetWidth;
            setItemWidth(width);
        }
    }, [displayContent]);

    // 动画循环：到达边界后重置继续（单元素无限循环）
    useEffect(() => {
        if (itemWidth === 0) return;
        if (!scrollRef.current) return;

        // 根据滚动方向设置初始位置（从屏幕外开始）
        const startOffset = baseVelocity > 0
            ? -itemWidth  // 向右滚动：从左侧屏幕外开始
            : window.innerWidth; // 向左滚动：从右侧屏幕外开始

        offsetRef.current = startOffset;

        const step = () => {
            // 每帧移动量（基于 60fps 估算）
            const moveBy = baseVelocity / 60;
            offsetRef.current += moveBy;

            // 检测是否完全滚出屏幕
            const isComplete = baseVelocity > 0
                ? offsetRef.current > window.innerWidth  // 向右滚动：超出右边界
                : offsetRef.current < -itemWidth; // 向左滚动：超出左边界

            // 完成一次滚动后，触发回调并重置到起点继续循环
            if (isComplete) {
                onAnimationComplete?.();
                offsetRef.current = startOffset;
            }

            // 更新 DOM transform（避免 React 重渲染）
            if (scrollRef.current) {
                scrollRef.current.style.transform = `translateX(${offsetRef.current}px)`;
            }

            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);

        // 清理函数
        return () => {
            if (animRef.current !== null) {
                cancelAnimationFrame(animRef.current);
            }
        };
    }, [itemWidth, baseVelocity, onAnimationComplete]);

    const handleDanmuClick = useCallback(() => {
        onDanmuClick(data);
    }, [data, onDanmuClick]);

    return (
        <div className="wish-danmu-container" onClick={handleDanmuClick}>
            <div
                className="scroll-content"
                ref={scrollRef}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    willChange: 'transform',
                    fontSize: '2rem',
                }}
            >
                {/* 单元素：删除重复内容，使用循环动画 */}
                <div className="danmu-item-wrapper">
                    <img
                        src={snowflakeImg}
                        alt="snowflake"
                        className="snowflake-icon"
                    />
                    <span className="danmu-text-bubble">{displayContent}</span>
                </div>
            </div>
        </div>
    );
};

export default WishDanmu;