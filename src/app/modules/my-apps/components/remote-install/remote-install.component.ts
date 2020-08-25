import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AutoInstallService } from '../../services/auto-install.service';

@Component({
  selector: 'dstore-remote-install',
  templateUrl: './remote-install.component.html',
  styleUrls: ['./remote-install.component.scss'],
})
export class RemoteInstallComponent implements OnInit {
  constructor(private autoInstallService: AutoInstallService) {}
  autoInstall$ = this.autoInstallService.getAutoInstall();
  free = null;
  @Output('freeChange') freeMessage = new EventEmitter<boolean>();
  ngOnInit() {}
  change(auto: boolean) {
    this.autoInstallService.setAutoInstall(auto);
  }
  free_check() {
    this.free = this.free !== false ? false : null;
    this.freeMessage.emit(this.free);
  }
}
