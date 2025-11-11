// 导入必要的模块 
import { useRef, useEffect, useState } from 'react';
import snowflakeImg from '@/assets/images/雪花.svg';

// 定义单条弹幕的数据结构 
export interface DanmuData {
    id: number | string;
    wishContent: string;
}

interface WishDanmuProps {
    data: DanmuData;
    baseVelocity?: number;
    onDanmuClick: (fullText: string) => void;
}

const MAX_CHARS = 10; // 最大显示字数

const WishDanmu = ({
    data,
    baseVelocity = -50,
    onDanmuClick
}: WishDanmuProps) => {
    const { wishContent } = data;
    const displayContent = wishContent.length > MAX_CHARS
        ? wishContent.substring(0, MAX_CHARS) + '...'
        : wishContent;

    const scrollRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const animRef = useRef<number | null>(null);
    const directionFactor = useRef(1);
    const [itemWidth, setItemWidth] = useState(0);
    const [repeatCount, setRepeatCount] = useState(3); // 默认重复 3 次

    // 计算单个弹幕项的宽度并计算需要的重复次数
    useEffect(() => {
        if (scrollRef.current && scrollRef.current.children[0]) {
            const width = (scrollRef.current.children[0] as HTMLElement).offsetWidth;
            setItemWidth(width);
            
            // 计算屏幕宽度需要多少个弹幕项来填满 + 1个额外的用于循环
            const screenWidth = window.innerWidth;
            const needed = Math.ceil(screenWidth / width) + 2;
            setRepeatCount(needed);
            
        }
    }, [displayContent]); // 当文本改变时重新计算

    // 动画循环（直接操作 DOM transform，避免每帧触发 React 渲染）
    useEffect(() => {
        if (itemWidth === 0 || repeatCount === 0) return;
        if (!scrollRef.current) return;

        const step = () => {
            // 可在此处调整速度因子，例如响应交互或不同设备负载
            const velocityFactor = 0; // set to non-zero to alter speed dynamically

            // 每帧移动量（以像素为单位），基于 60fps 估算
            const moveBy = (baseVelocity / 60) * (1 + Math.abs(velocityFactor) * 0.1) * directionFactor.current;

            offsetRef.current += moveBy;

            // 无限循环边界处理
            if (offsetRef.current < -itemWidth) {
                offsetRef.current += itemWidth;
            }
            if (offsetRef.current > 0) {
                offsetRef.current -= itemWidth;
            }

            // 直接更新 DOM transform，避免 setState
            if (scrollRef.current) {
                scrollRef.current.style.transform = `translateX(${offsetRef.current}px)`;
            }

            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);

        return () => {
            if (animRef.current != null) cancelAnimationFrame(animRef.current);
        };
    }, [itemWidth, baseVelocity, repeatCount]);

    const handleDanmuClick = () => {
        onDanmuClick(wishContent);
    };

    return (
        <div className="wish-danmu-container" onClick={handleDanmuClick}> 
            <div
                className="scroll-content"
                ref={scrollRef}
                style={{
                    display: 'flex', 
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                }}
            >
                {/* 渲染足够多的弹幕项来填满屏幕 */}
                {Array.from({ length: repeatCount }).map((_, index) => (
                    <div key={index} className="danmu-item-wrapper">
                        {/* 1. 雪花图片 */}
                        <img 
                            src={snowflakeImg} 
                            alt="snowflake" 
                            className="snowflake-icon" 
                        />
                        {/* 2. 文本内容 */}
                        <span className="danmu-text-bubble">
                            {displayContent}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
 
export default WishDanmu;