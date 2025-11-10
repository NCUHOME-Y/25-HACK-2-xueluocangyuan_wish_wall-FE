import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { 
    motion,
    useMotionValue, 
    useTransform, 
    useSpring, 
    useAnimationFrame, 
    useVelocity,
    useScroll
} from 'framer-motion';
import { wrap } from '@motionone/utils';

interface WishDamakuProps {
    imageUrl: string;
    wishContent: string;
    baseVelocity: number;
}

const WishDamaku = ({
    imageUrl,
    wishContent,
    baseVelocity = -1
}: WishDamakuProps) => {
    const baseX = useMotionValue(0);
    const {scrollY} = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
        clamp: true
    });

    const textRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [totalText, setTotalText] = useState<string>(wishContent);
    const [wrapRange, setWrapRange] = useState<number[]>([-100, 0]);

    const x = useTransform(baseX, (v) => `${wrap(wrapRange[0], wrapRange[1], v)}%`);

    const calculateRepeatText = useCallback(() => {
        // 检查元素是否存在
        if (!textRef.current) return;

        // 检查元素是否可见
        const rect = textRef.current.getBoundingClientRect();
        if (rect.width === 0) return;

        const textWidth = rect.width;
        const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
        const repeatCount = Math.ceil(containerWidth / textWidth) + 2;

        const repeatText = Array(repeatCount).fill(wishContent).join('   ');
        setTotalText(repeatText);

        const totalWidth = repeatCount * textWidth;
        setWrapRange([-totalWidth, 0]);
    }, [wishContent]);

    useLayoutEffect(() => {
        calculateRepeatText();
        window.addEventListener('resize', calculateRepeatText);

        return () => window.removeEventListener('resize', calculateRepeatText);
    }, [calculateRepeatText]);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((_, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        const currentVelocityFactor = velocityFactor.get();

        if (currentVelocityFactor < 0) {
            directionFactor.current = -1;
        } else if (currentVelocityFactor > 0) {
            directionFactor.current = 1;
        }

        moveBy *= (1 + Math.abs(currentVelocityFactor)*0.1);

        baseX.set(baseX.get() + moveBy);
    });

    const textStyle = {whiteSpace: 'nowrap'};

    return (
        <div className="wish-damaku-container" ref={containerRef}>
            <motion.div 
                className="scroll" 
                style={{
                    x,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                <motion.img src={imageUrl} className="wish-damaku-image" alt="雪花" style={{ flexShrink: 0 }} />
                <motion.span className="wish-damaku-text" style={textStyle} ref={textRef}>
                    {totalText}
                </motion.span>
            </motion.div>

        </div>
    );
};

export default WishDamaku;
