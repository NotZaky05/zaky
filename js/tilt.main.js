class TiltEffect {
    constructor(element, options = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Element must be a valid HTML element');
        }

        this.element = element;
        this.options = {
            maxTilt: 15,
            perspective: 1000,
            scale: 1.05,
            speed: 500,
            easing: 'cubic-bezier(.03,.98,.52,.99)',
            minTilt: -15,
            smoothing: 0.1,
            parallax: true,
            parallaxMultiplier: 0.13,
            parallaxRotate: true,
            maxParallax: 100,
            minParallax: -100,
            ...options
        };

        this.currentTiltX = 0;
        this.currentTiltY = 0;
        this.currentParallaxX = 0;
        this.currentParallaxY = 0;
        this.currentScale = 1;
        this.targetScale = 1;
        this.isRunning = false;
        this.rafId = null;
        this.parallaxElements = [];
        
        this.validateOptions();
        this.init();
    }

    validateOptions() {
        if (this.options.maxTilt < this.options.minTilt) {
            throw new Error('maxTilt must be greater than minTilt');
        }
        if (this.options.smoothing < 0 || this.options.smoothing > 1) {
            throw new Error('smoothing must be between 0 and 1');
        }
        if (this.options.scale <= 0) {
            throw new Error('scale must be greater than 0');
        }
        if (this.options.parallaxMultiplier < 0) {
            throw new Error('parallaxMultiplier must be positive');
        }
        if (this.options.maxParallax < this.options.minParallax) {
            throw new Error('maxParallax must be greater than minParallax');
        }
    }

    init() {
        this.element.style.transition = `${this.options.speed}ms ${this.options.easing}`;
        
        if (this.options.parallax) {
            this.initParallaxElements();
        }
        
        this.addEventListeners();
    }

    initParallaxElements() {
        this.parallaxElements = Array.from(this.element.children).map(el => {
            const multiplier = parseFloat(el.getAttribute('parallax-mult')) || 
                               this.options.parallaxMultiplier;
            return { element: el, multiplier };
        });
    }

    addEventListeners() {
        this.onEnterBind = this.onEnter.bind(this);
        this.onMoveBind = this.throttle(this.onMove.bind(this), 16);
        this.onLeaveBind = this.onLeave.bind(this);

        const events = {
            mouse: {
                enter: 'mouseenter',
                move: 'mousemove',
                leave: 'mouseleave'
            },
            touch: {
                enter: 'touchstart',
                move: 'touchmove',
                leave: 'touchend'
            }
        };

        Object.values(events).forEach(eventGroup => {
            this.element.addEventListener(eventGroup.enter, this.onEnterBind, { passive: true });
            this.element.addEventListener(eventGroup.move, this.onMoveBind, { passive: true });
            this.element.addEventListener(eventGroup.leave, this.onLeaveBind, { passive: true });
        });
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    onEnter(event) {
        this.isRunning = true;
        this.targetScale = this.options.scale;
        this.startAnimation();
    }

    onMove(event) {
        const rect = this.element.getBoundingClientRect();
        const { clientX, clientY } = event.type.includes('mouse') ? event : event.touches[0];

        const middleX = rect.left + rect.width / 2;
        const middleY = rect.top + rect.height / 2;

        const relativeX = (middleX - clientX) / (rect.width / 2);
        const relativeY = (clientY - middleY) / (rect.height / 2);

        let tiltX = relativeY * this.options.maxTilt;
        let tiltY = relativeX * this.options.maxTilt;

        this.targetTiltX = this.clamp(tiltX, this.options.minTilt, this.options.maxTilt);
        this.targetTiltY = this.clamp(tiltY, this.options.minTilt, this.options.maxTilt);

        if (this.options.parallax) {
            this.targetParallaxX = this.clamp(relativeX * -100, this.options.minParallax, this.options.maxParallax);
            this.targetParallaxY = this.clamp(relativeY * -100, this.options.minParallax, this.options.maxParallax);
        }
    }

    onLeave() {
        this.targetTiltX = 0;
        this.targetTiltY = 0;
        this.targetParallaxX = 0;
        this.targetParallaxY = 0;
        this.targetScale = 1;
        setTimeout(() => {
            this.isRunning = false;
        }, this.options.speed);
    }

    startAnimation() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        const animate = () => {
            if (!this.isRunning && 
                Math.abs(this.currentTiltX) < 0.01 && 
                Math.abs(this.currentTiltY) < 0.01 &&
                Math.abs(this.currentParallaxX) < 0.01 && 
                Math.abs(this.currentParallaxY) < 0.01 &&
                Math.abs(this.currentScale - 1) < 0.001) {
                cancelAnimationFrame(this.rafId);
                return;
            }

            this.currentTiltX = this.lerp(this.currentTiltX, this.targetTiltX || 0, this.options.smoothing);
            this.currentTiltY = this.lerp(this.currentTiltY, this.targetTiltY || 0, this.options.smoothing);
            
            this.currentScale = this.lerp(this.currentScale, this.targetScale, this.options.smoothing);

            if (this.options.parallax) {
                this.currentParallaxX = this.lerp(this.currentParallaxX, this.targetParallaxX || 0, this.options.smoothing);
                this.currentParallaxY = this.lerp(this.currentParallaxY, this.targetParallaxY || 0, this.options.smoothing);
            }

            this.updateElementStyle();
            this.rafId = requestAnimationFrame(animate);
        };

        this.rafId = requestAnimationFrame(animate);
    }

    updateElementStyle() {
        if (!this.element) return;

        const transform = `
            perspective(${this.options.perspective}px) 
            rotateX(${this.currentTiltX}deg) 
            rotateY(${this.currentTiltY}deg) 
            scale3d(${this.currentScale}, ${this.currentScale}, ${this.currentScale})
        `;
        this.element.style.transform = transform.replace(/\s+/g, ' ').trim();

        if (this.options.parallax) {
            this.parallaxElements.forEach(({ element, multiplier }) => {
                const parallaxX = this.currentParallaxX * multiplier;
                const parallaxY = this.currentParallaxY * multiplier;
                
                let parallaxTransform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
                
                if (this.options.parallaxRotate) {
                    parallaxTransform += ` rotateX(${this.currentTiltX * multiplier}deg) rotateY(${this.currentTiltY * multiplier}deg)`;
                }
                
                element.style.transform = parallaxTransform;
            });
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        const events = ['mouseenter', 'mousemove', 'mouseleave', 'touchstart', 'touchmove', 'touchend'];
        events.forEach(event => {
            this.element.removeEventListener(event, this.onEnterBind);
            this.element.removeEventListener(event, this.onMoveBind);
            this.element.removeEventListener(event, this.onLeaveBind);
        });

        if (this.parallaxElements.length) {
            this.parallaxElements.forEach(({ element }) => {
                element.style.transform = '';
            });
        }

        this.element.style.transform = '';
        this.element.style.transition = '';

        this.parallaxElements = [];
        this.element = null;
        this.options = null;
        this.isRunning = false;
    }
}

const tiltElements = document.querySelectorAll('.tilt');
const tiltInstances = [];

tiltElements.forEach((element) => {
    const tilt = new TiltEffect(element, {
        maxTilt: 13,
        minTilt: -13,
        smoothing: 0.15,
        scale: 1.05,
        speed: 500,
        parallax: true,
        parallaxMultiplier: 0.09,
        parallaxRotate: true,
        maxParallax: 100,
        minParallax: -100
    });
    tiltInstances.push(tilt);
});

window.addEventListener('unload', () => {
    tiltInstances.forEach(tilt => {
        tilt.destroy();
    });
});



