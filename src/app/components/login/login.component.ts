import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit() {
    this.init();
  }
  async init() {
    const [code, state] = ['code', 'state'].map(name => this.route.snapshot.queryParamMap.get(name));
    await this.auth.auth(code, state);
    location.href = '/';
  }
}
