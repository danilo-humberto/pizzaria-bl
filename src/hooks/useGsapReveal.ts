import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function useGsapReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]')
      const revealItems = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      const floatItems = gsap.utils.toArray<HTMLElement>('[data-float]')
      const heroBowl = gsap.utils.toArray<HTMLElement>('[data-hero-bowl]')
      const getMotionNumber = (value: string | undefined, fallback: number) => {
        const parsed = Number(value)

        return Number.isFinite(parsed) ? parsed : fallback
      }

      if (prefersReducedMotion) {
        gsap.set([...heroItems, ...revealItems, ...floatItems, ...heroBowl], {
          opacity: 1,
          clearProps: 'transform',
        })
        return
      }

      gsap.from(heroItems, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.08,
      })

      gsap.from(heroBowl, {
        y: 18,
        scale: 0.96,
        opacity: 0,
        duration: 0.95,
        ease: 'power4.out',
        delay: 0.18,
      })

      revealItems.forEach((item) => {
        gsap.from(item, {
          y: 34,
          opacity: 0,
          duration: 0.72,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 86%',
          },
        })
      })

      gsap.set(floatItems, {
        transformOrigin: '50% 50%',
      })

      floatItems.forEach((item, index) => {
        const fallbackY = index % 2 === 0 ? -14 : 12
        const fallbackX = index % 3 === 0 ? 8 : -6
        const fallbackRotate = index % 2 === 0 ? 4 : -5

        gsap.to(item, {
          y: getMotionNumber(item.dataset.floatY, fallbackY),
          x: getMotionNumber(item.dataset.floatX, fallbackX),
          rotate: getMotionNumber(item.dataset.floatRotate, fallbackRotate),
          duration: getMotionNumber(
            item.dataset.floatDuration,
            2.8 + index * 0.25,
          ),
          delay: getMotionNumber(item.dataset.floatDelay, index * 0.04),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    },
    { scope },
  )
}
