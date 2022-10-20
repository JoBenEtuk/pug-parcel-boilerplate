import Component from '../classes/Component'
import gsap from 'gsap'

export default class Preloader extends Component {
	constructor() {
		super({
			element: '.transition',
			elements: {},
		})
	}

	show() {
		return new Promise((resolve) => {
			gsap.set(this.element, {
				height: '0',
				top: 0,
				duration: 0.1,
			})

			gsap.timeline().to(this.element, {
				height: '100%',
				duration: 1,
				ease: 'expo.inOut',
				onComplete: resolve,
			})
		})
	}

	hide() {
		return new Promise((resolve) => {
			gsap.timeline().to(this.element, {
				top: '100%',
				duration: 1,
				ease: 'expo.inOut',
				onComplete: resolve,
			})
		})
	}
}
