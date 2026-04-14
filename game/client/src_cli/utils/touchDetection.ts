export function touchDetection(): boolean {
    const nav = navigator as any;
    return ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        nav.msMaxTouchPoints > 0 ||
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    );
}