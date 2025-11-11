import React, { useState, useMemo } from 'react';
import WishDamaku, { type DamakuData } from './WishDanmu.tsx';
import Modal from '@/components/common/Modal.tsx';
import '@/styles/wishdanmu.css'; // 引入样式文件

// 模拟从后端获取的数据 (请雨木木替换为实际的 API 调用)
const mockData: DamakuData[] = [
    { id: 1, wishContent: "喵喵可爱喵喵，可爱喵喵喵" },
    { id: 2, wishContent: "希望明年可以顺利通过考试，加油！" },
    { id: 3, wishContent: "唉唉啥时候能赶完啊" },
    { id: 4, wishContent: "我靠果汁楼真好啊！" },
    { id: 5, wishContent: "超级长的祝福语测试，看能不能成功截断。截断后点开弹窗展示全部内容。" },
    { id: 6, wishContent: "再来一条短一点的。" },
    { id: 7, wishContent: "速度测试，看看不同速度的效果。" },
];

const DamakuFlow: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // 调试：打印容器信息
        if (containerRef.current) {
            console.log('DamakuFlow 容器:', containerRef.current);
            console.log('DamakuFlow 容器尺寸:', {
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
            console.log('DamakuFlow 容器计算样式:', {
                display: window.getComputedStyle(containerRef.current).display,
                flex: window.getComputedStyle(containerRef.current).flex,
            });
        }
    }, []);

    const handleDamakuClick = (fullText: string) => {
        setModalContent(fullText);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent('');
    };

    // 根据数据动态创建多行弹幕，并设置不同的基础速度
    const damakuRows = useMemo(() => {
        return mockData.map((data, index) => {
            // 基础速度，可以根据索引或随机值来设置
            const baseVelocity = (index % 2 === 0 ? -1 : 1) * (50 + (index % 3) * 10); // 随机速度和方向
            
            return (
                <div 
                    key={data.id} 
                    style={{ 
                        width: '100%', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    className={`damaku-row damaku-row-${index}`}
                >
                    <WishDamaku
                        data={data}
                        baseVelocity={baseVelocity}
                        onDamakuClick={handleDamakuClick}
                    />
                </div>
            );
        });
    }, []);

    return (
        <div className="damaku-flow-container" ref={containerRef}>
            {/* 弹幕区域，占据可用高度 */}
            <div className="damaku-area">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {damakuRows}
                </div>
            </div>

            {/* 弹窗组件 */}
            <Modal
                visible={isModalOpen}
                onClose={handleCloseModal}
                children={modalContent}
            />
        </div>
    );
};

export default DamakuFlow;