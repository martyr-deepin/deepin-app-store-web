// 定义动画的ts文件
import { trigger, transition, style, query, stagger, animate } from '@angular/animations';
/**
 * 滑动动画 利用位移
 */
export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateY(50%)' }),
    animate('1000ms ease-in', style({ transform: 'translateY(0%)' })),
  ]),
  transition(':leave', [style({ zIndex: '-5' }), animate('800ms ease-in', style({ transform: 'translateY(50%)' }))]),
]);
/**
 * 滑动动画 利用定位
 */
export const myInsertRemoveTrigger = trigger('myInsertRemoveTrigger', [
  transition(':enter', [
    style({ bottom: '-58px' }),
    animate('2000ms ease-in-out', style({ bottom: '0px' })),
  ]),
  transition(':leave', [animate('1000ms ease-in-out', style({ bottom: '-58px' }))]),
]);
/**
 * 滑动动画 通过匹配子元素
 */
export const pageAnimations = trigger('pageAnimations', [
  transition(':enter', [
    query('.wait', [
      style({ opacity: 0, transform: 'translateY(-100%)', height: '0px' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%)', height: '120px' })),
      stagger(-30, [animate('800ms ease-in', style({ opacity: 0, transform: 'none', height: '0px' }))]),
    ]),
  ]),
]);
