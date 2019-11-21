import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, style, transition, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('dlcIn', [
      transition(':enter', [style({ width: 0 }), animate(100)]),
      transition(':leave', [animate(100, style({ width: 0 }))]),
    ]),
  ],
})
export class SideNavComponent implements OnInit {
  constructor(private sanitizer: DomSanitizer) {}
  native = environment.native;
  // download count
  dc$: Observable<number>;

  ngOnInit() {}

  getStyle(icons: string[]) {
    return this.sanitizer.bypassSecurityTrustStyle(icons.map(url => `url(${url})`).join(','));
  }
}
