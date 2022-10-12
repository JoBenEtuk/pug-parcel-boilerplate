import Component from '../classes/Component'
import gsap from 'gsap'

export default class Preloader extends Component {
	constructor() {
		super({
			element: '.preloader',
			elements: {
				title: '.preloader__text',
				numberWrapper: '.preloader__number__wrapper',
				numberText: '.preloader__number',
			},
		})

		this.images = [...document.querySelectorAll('[data-src]')]

		this.length = 0
		this.interval
		this.createLoader()
	}

	createLoader() {
		if (this.images.length > 0) {
			this.images.forEach((image) => {
				const media = new window.Image()
				const src = image.getAttribute('data-src')
				media.crossOrigin = 'anonymous'
				media.src = src

				media.onload = (_) => {
					image.setAttribute('src', src)
					this.onAssetLoaded()
				}
			})
		} else {
			this.interval = setInterval(() => {
				this.length < 99 ? (this.length += 1) : (this.length = 100)
				this.elements.numberText.innerHTML = `${this.length}%`
			}, 27)

			gsap
				.timeline()
				.to(this.element, {
					opacity: 1,
					duration: 3,
				})
				.call(() => this.onLoaded())
		}
	}

	// Preloading
	onAssetLoaded() {
		this.length += 1

		const percent = this.length / this.images.length

		const wrapperWidth = this.elements.numberWrapper.offsetWidth
		const numberWidth = this.elements.numberText.offsetWidth
		const width = wrapperWidth - numberWidth - 20

		const translateX = width * percent

		this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`

		gsap.to(this.elements.numberText, {
			duration: 0.2,
			ease: 'none',
			x: translateX,
		})

		if (percent === 1) {
			setTimeout(() => {
				this.onLoaded()
			}, 1000)
		}
	}

	onLoaded() {
		this.interval = setInterval(() => {
			this.counter < 99 ? (this.counter += 1) : (this.counter = 100)
			this.elements.numberText.innerHTML = `${this.counter}%`
		}, 27)

		const tl = gsap.timeline({
			onComplete: () => {
				this.destroy()
				// this.createAnimation()
			},
		})

		tl.to(this.element, {
			x: '100vw',
			duration: 1.5,
			ease: 'expo.in',
		}).call((_) => this.emit('completed'))
	}

	destroy() {
		this.element.parentNode.removeChild(this.element)
		setTimeout(() => {
			clearInterval(this.interval)
		}, 4000)
	}
}
