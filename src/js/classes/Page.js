import AutoBind from 'auto-bind'
import EventEmitter from 'events'
import Prefix from 'prefix'
import NormalizeWheel from 'normalize-wheel'
import { map, each } from 'lodash'

import { clamp, lerp } from '../utils/math'

export default class Page extends EventEmitter {
	constructor({ classes, element, elements, isScrollable = true }) {
		super()

		AutoBind(this)

		this.classes = {
			...classes,
		}

		this.selectors = {
			element,
			elements: {
				...elements,
			},
		}

		this.isScrollable = isScrollable

		this.scroll = {
			ease: 0.1,
			position: 0,
			current: 0,
			target: 0,
			limit: 0,
		}

		this.transformPrefix = Prefix('transform')

		this.create()
		if (window.innerWidth > 768) {
			this.initSmoothScroll()
		}
	}

	create() {
		this.reset()

		this.animations = []

		this.element = document.querySelector(this.selectors.element)
		this.elements = {}

		each(this.selectors.elements, (selector, key) => {
			if (selector instanceof window.HTMLElement || selector instanceof window.NodeList) {
				this.elements[key] = selector
			} else if (Array.isArray(selector)) {
				this.elements[key] = selector
			} else {
				this.elements[key] = this.element.querySelectorAll(selector)

				if (this.elements[key].length === 0) {
					this.elements[key] = null
				} else if (this.elements[key].length === 1) {
					this.elements[key] = this.element.querySelector(selector)
				}
			}
		})
		this.createAnimations()
		// this.createObserver();
		this.createPreloaders()
	}

	/**
	 * Preload images.
	 */
	createPreloaders() {
		this.preloaders = map(this.elements.preloaders, (element) => {
			return new AsyncLoad({
				element,
			})
		})
	}

	createAnimations() {}

	/**
	 * Observer.
	 */
	createObserver() {
		this.observer = new window.ResizeObserver((entries) => {
			for (const entry of entries) {
				// eslint-disable-line
				window.requestAnimationFrame((_) => {
					this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
				})
			}
		})

		this.observer.observe(this.elements.wrapper)
	}

	reset() {
		this.scroll = {
			ease: window.innerWidth > 600 ? 0.075 : 0.1,
			position: 0,
			current: 0,
			target: 0,
			limit: 0,
		}
	}

	show() {
		this.reset()
		this.addEventListeners()
		return Promise.resolve()
	}

	hide() {
		this.removeEventListeners()
		return Promise.resolve()
	}

	transform(element, y) {
		element.style[this.transformPrefix] = `translate3d(0, ${-Math.round(y)}px, 0)`
	}
	/**
	 * Events
	 */
	onResize() {
		if (!this.elements.wrapper) return

		window.requestAnimationFrame((_) => {
			this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight

			each(this.animations, (animation) => {
				animation.onResize && animation.onResize()
			})
		})
	}

	onWheel(event) {
		const normalized = NormalizeWheel(event)
		const speed = normalized.pixelY

		this.scroll.target += speed
	}

	onTouchDown(event) {
		this.isDown = true

		this.scroll.position = this.scroll.current
		this.start = event.touches ? event.touches[0].clientY : event.clientY
	}

	onTouchMove(event) {
		if (!this.isDown) return

		const y = event.touches ? event.touches[0].clientY : event.clientY
		const distance = (this.start - y) * 2

		this.scroll.target = this.scroll.position + distance
	}

	onTouchUp(event) {
		this.isDown = false
	}

	/**
	 * Update
	 */

	initSmoothScroll() {
		document.body.style.overflow = 'hidden'
		document.body.style.position = 'fixed'

		this.update()
		this.frame = window.requestAnimationFrame(this.initSmoothScroll.bind(this))
	}

	update() {
		this.scroll.target = clamp(0, this.scroll.limit, this.scroll.target)

		this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)

		if (this.scroll.current < 0.1) {
			this.scroll.current = 0
		}

		if (this.elements.wrapper) {
			this.transform(this.elements.wrapper, this.scroll.current)
		}
	}

	addEventListeners() {}
	removeEventListeners() {}
}
