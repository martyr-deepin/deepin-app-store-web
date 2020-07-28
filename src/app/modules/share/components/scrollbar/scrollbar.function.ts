import { ScrollbarComponent } from './scrollbar.component';

export const mutationOption = {
  childList:true,
  attributes: false,
  characterData: false,
  subtree:true,
  attributeOldValue: false,
  characterDataOldValue: false
}

export function isMac(){
  return /macintosh|mac os x/i.test(navigator.userAgent);
}

export function mouseMove(event:MouseEvent,_this:ScrollbarComponent){
  const prevPage = _this.click_y;
  if(!prevPage) return;
  const offset = (_this.$scroll_box.getBoundingClientRect().top - event.clientY) * -1
  const bar_position = (_this.$scroll_bar.offsetHeight - _this.click_y);
  const bar_position_Percentage = (offset - bar_position) * 100 / _this.$scroll_box.offsetHeight;
  _this.$scroll_box.scrollTop = bar_position_Percentage * _this.$scroll_box.scrollHeight / 100;
}

export function mouseUp(_this:ScrollbarComponent) {
  _this.$scroll_Y.style.width = "";
  _this.$scroll_Y.style.borderRadius = "";
  document.onselectstart = null;
}

export function clickY(event:any,_this:ScrollbarComponent) {
  let offset = Math.abs(event.target.getBoundingClientRect().top - event.clientY)
  let bar_center = _this.$scroll_bar.offsetHeight / 2;
  let bar_position = (offset - bar_center) * 100 / _this.$scroll_box.offsetHeight;
  let scrollTop = bar_position * _this.$scroll_box.scrollHeight / 100
  _this.$scroll_box.scrollTop = scrollTop;
}

export function scrollY(event:MouseEvent,_this:ScrollbarComponent) {
  const moveY = (_this.$scroll_box.scrollTop*100/_this.$scroll_box.clientHeight)
  _this.$scroll_bar.style.transform = "translateY("+moveY+"%)";
  let i = setTimeout(()=>{
    _this.$scroll_Y.style.opacity = "1";
    _this.hideY$.next(true);
    clearTimeout(i)
  })
}