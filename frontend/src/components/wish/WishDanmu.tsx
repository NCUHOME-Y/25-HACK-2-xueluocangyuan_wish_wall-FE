// 导入必要的模块 
import { useRef, useEffect, useState } from 'react';
import snowflakeImg from '@/assets/images/雪花.svg';

// 定义单条弹幕的数据结构 
export interface DamakuData {
    id: number | string;
    wishContent: string;
}

interface WishDamakuProps {
    data: DamakuData;
    baseVelocity?: number;
    onDamakuClick: (fullText: string) => void;
}

const MAX_CHARS = 10; // 最大显示字数

const WishDamaku = ({
    data,
    baseVelocity = -50,
    onDamakuClick
}: WishDamakuProps) => {
    const { wishContent } = data;
    const displayContent = wishContent.length > MAX_CHARS
        ? wishContent.substring(0, MAX_CHARS) + '...'
        : wishContent;

    const scrollRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
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
            
            console.log('弹幕宽度计算:', { itemWidth: width, screenWidth, needed });
        }
    }, [displayContent]); // 当文本改变时重新计算

    // 动画循环
    useEffect(() => {
        if (itemWidth === 0 || repeatCount === 0) return;

        let animationId: number;
        let currentOffset = 0;

        const animate = () => {
            currentOffset += baseVelocity / 60; // 60fps 动画
            
            // 无限循环
            if (currentOffset < -itemWidth) {
                currentOffset += itemWidth;
            }
            if (currentOffset > 0) {
                currentOffset -= itemWidth;
            }

            setOffset(currentOffset);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [itemWidth, baseVelocity, repeatCount]);

    const handleDamakuClick = () => {
        onDamakuClick(wishContent);
    };

    return (
        <div className="wish-damaku-container" onClick={handleDamakuClick}> 
            <div
                className="scroll-content"
                ref={scrollRef}
                style={{
                    display: 'flex', 
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transform: `translateX(${offset}px)`,
                    transition: 'none',
                }}
            >
                {/* 渲染足够多的弹幕项来填满屏幕 */}
                {Array.from({ length: repeatCount }).map((_, index) => (
                    <div key={index} className="damaku-item-wrapper">
                        {/* 1. 雪花图片 */}
                        <img 
                            src={snowflakeImg} 
                            alt="snowflake" 
                            className="snowflake-icon" 
                        />
                        {/* 2. 文本内容 */}
                        <span className="damaku-text-bubble">
                            {displayContent}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishDamaku;