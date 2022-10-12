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
		}
	}

	onAssetLoaded(image) {
		this.length += 1

		const percent = this.length / this.images.length
		this.elements.number.innerHTML = `${Math.round(percent * 100)}%`

		if (percent === 1) {
			this.onLoaded()
		}
	}

	onLoaded() {
		this.emit('completed')
		const tl = gsap.timeline({
			onComplete: () => {
				this.destroy()
			},
		})
		// .call((_) => this.emit("completed"));

		tl.to(this.element, {
			duration: 0.5,
			autoAlpha: 0,
			ease: 'power3.out',
		})
	}

	destroy() {
		this.element.parentNode.removeChild(this.element)
	}
}
