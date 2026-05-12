export interface CascadeGroup {
  selector: string;
  stagger?: number;
}

export class CascadeAnimator {
  private observer: MutationObserver | null = null;
  private tracked = new Set<string>();
  private reduced: boolean;
  private io: IntersectionObserver | null = null;
  private ioMap = new Map<Element, () => void>();
  private safeTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollCount = 0;
  private gsap: Promise<any> | null = null;

  constructor(
    private host: HTMLElement,
    groups: CascadeGroup[],
  ) {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.gsap = import('gsap').then((m) => m.gsap);

    const check = () => this.check(groups);
    this.observer = new MutationObserver(check);
    this.observer.observe(host, { childList: true, subtree: true });
    check();
  }

  private check(groups: CascadeGroup[]): void {
    for (const group of groups) {
      if (this.tracked.has(group.selector)) continue;
      const elements = this.host.querySelectorAll(group.selector) as NodeListOf<HTMLElement>;
      if (elements.length === 0) continue;
      this.tracked.add(group.selector);
      this.animate(elements, group);
    }
  }

  private forceVisible(): void {
    const els = this.host.querySelectorAll('[style*="opacity: 0"]') as NodeListOf<HTMLElement>;
    if (els.length === 0) {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      return;
    }
    els.forEach((el) => {
      if (getComputedStyle(el).opacity === '0') {
        el.style.opacity = '';
        el.style.transform = '';
      }
    });
  }

  private startPolling(): void {
    if (this.pollTimer) return;
    this.pollCount = 0;
    this.pollTimer = setInterval(() => {
      this.pollCount++;
      this.forceVisible();
      if (this.pollCount >= 20) {
        if (this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = null;
        }
      }
    }, 500);
  }

  private observeTrigger(trigger: Element, onEnter: () => void): void {
    if (!this.io) {
      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cb = this.ioMap.get(entry.target);
              if (cb) {
                cb();
                this.ioMap.delete(entry.target);
                this.io?.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0, rootMargin: '-10% 0px 0px 0px' },
      );
    }
    this.ioMap.set(trigger, onEnter);
    this.io.observe(trigger);
  }

  private animate(elements: NodeListOf<HTMLElement>, group: CascadeGroup): void {
    const arr = Array.from(elements);
    if (this.reduced) return;

    const trigger = arr[0]?.parentElement ?? this.host;

    arr.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
    });

    this.observeTrigger(trigger, async () => {
      const gsap = await this.gsap;
      arr.forEach((el) => (el.style.willChange = 'opacity, transform'));
      gsap.to(arr, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: group.stagger ?? 0.15,
        onComplete: () => arr.forEach((el) => (el.style.willChange = '')),
      });
    });

    if (!this.safeTimer) {
      this.safeTimer = setTimeout(() => this.forceVisible(), 4000);
    }
    this.startPolling();
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
    this.ioMap.clear();
    if (this.safeTimer) {
      clearTimeout(this.safeTimer);
      this.safeTimer = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    (this.host.querySelectorAll('[style*="will-change"]') as NodeListOf<HTMLElement>).forEach((el) => {
      el.style.willChange = '';
    });
  }
}
