export type UmamiWindow = Window & { umami?: { track: (event: string) => void } };

/**
 * 统一的 Umami 埋点函数：若 umami 未就绪，则等待一次 umami:ready 再上报。
 */
export function trackUmami(event: string) {
    const w = window as UmamiWindow;
    if (w.umami) {
        w.umami.track(event);
        return;
    }
    window.addEventListener(
        'umami:ready',
        () => {
            (window as UmamiWindow).umami?.track(event);
        },
        { once: true }
    );
}
