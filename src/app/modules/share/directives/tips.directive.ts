import { Directive, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';


@Directive({
  selector: '[dstoreTips]',
})
export class TipsDirective implements AfterViewInit, OnDestroy {

  constructor(private elRef: ElementRef<HTMLElement>) {}

  div:HTMLDivElement;
  maxWidth:number;
  fontWidth:number;
  line:number;

  ngAfterViewInit(): void {
    let dom = this.elRef.nativeElement;
    this.maxWidth = dom.offsetWidth;
    //判断文字是否溢出
    if(dom.scrollWidth>dom.clientWidth) {
      //获取需要显示的信息
      const text = dom.innerText;
      this.fontWidth = this.getTextWidth(text,document.body.style.fontSize);
      //生成tip弹框组件
      this.div = document.createElement("div")
      this.div.classList.add("dstore_directive_tips");
      this.div.innerText = text;
      this.div.style.display = 'none'
      this.div.style.position = "absolute"
      this.div.style.maxWidth = this.maxWidth+"px";
      //添加hover事件
      dom.addEventListener("mouseenter",() => {
        this.div.style.left = this.getElementLeft(dom)+"px";
        this.div.style.top = this.getElementTop(dom)+"px";
        this.div.style.display = "block"
      })
      dom.addEventListener("mouseleave",() => {
        this.div.style.display = "none"
      })
      //插入body
      document.body.appendChild(this.div)
    }
  }

  ngOnDestroy() {
    if(this.div) {
    document.body.removeChild(this.div)
    }
  }

  getElementLeft(element:HTMLElement){
    var actualLeft = element.offsetLeft;
    var current = <HTMLElement>element.offsetParent;
    while (current !== null){
      actualLeft += current.offsetLeft;
      current =  <HTMLElement>current.offsetParent;
    }
    return actualLeft;
  }

  getElementTop(element:HTMLElement){
    var actualTop = element.offsetTop;
    var current = <HTMLElement>element.offsetParent;
    while (current !== null){
      actualTop += current.offsetTop;
      current =  <HTMLElement>current.offsetParent;
    }
    return actualTop - Math.ceil(this.fontWidth/this.maxWidth)*18 - 10;
  }

  //计算文本的宽度
  getTextWidth(str:string, fontSize?:string) {
    var width = 0;
    var html = document.createElement('span');
    html.innerText = str;
    html.className = 'getTextWidth';
    //是否指定字体大小
    if (fontSize) {
      html.style.fontSize = fontSize;
    }
    document.querySelector('body').appendChild(html);
    width = document.querySelector<HTMLDivElement>('.getTextWidth').offsetWidth;
    document.querySelector('.getTextWidth').remove();
    return width;
  }
}
