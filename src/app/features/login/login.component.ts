import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="login-card">

        <div class="login-brand">
          <div class="brand-icon"><i class="bi bi-bus-front-fill"></i></div>
          <h1>TransportPlatform</h1>
          <p>Backoffice Administration</p>
        </div>

        <form (ngSubmit)="login()" #f="ngForm">
          <div class="mb-3">
            <label class="form-label">Email address</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input type="email" class="form-control" name="email"
                     [(ngModel)]="email" required autocomplete="email"
                     placeholder="you@example.com" />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input [type]="showPwd() ? 'text' : 'password'" class="form-control"
                     name="password" [(ngModel)]="password"
                     required autocomplete="current-password"
                     placeholder="••••••••" />
              <button class="btn btn-outline-secondary" type="button"
                      (click)="showPwd.set(!showPwd())">
                <i [class]="'bi ' + (showPwd() ? 'bi-eye-slash' : 'bi-eye')"></i>
              </button>
            </div>
          </div>

          @if (error()) {
            <div class="alert alert-danger py-2 px-3 mb-3">
              <i class="bi bi-exclamation-circle me-1"></i> {{ error() }}
            </div>
          }

          <button type="submit" class="btn btn-primary w-100"
                  [disabled]="loading() || f.invalid">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Sign in
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); }

    .login-card { width: 380px; background: #fff; border-radius: 16px;
      padding: 40px 36px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }

    .login-brand { text-align: center; margin-bottom: 32px; }
    .brand-icon { display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: 14px; background: #4f46e5;
      margin-bottom: 14px; }
    .brand-icon i { font-size: 26px; color: #fff; }
    .login-brand h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .login-brand p { font-size: 12px; color: #94a3b8; margin: 0;
      text-transform: uppercase; letter-spacing: .06em; }

    .form-label { font-size: 13px; font-weight: 600; color: #374151; }
    .form-control, .input-group-text { font-size: 14px; }
    .input-group-text { color: #94a3b8; background: #f8fafc; }
    .btn-primary { background: #4f46e5; border-color: #4f46e5; font-size: 14px;
      font-weight: 600; padding: 10px; }
    .btn-primary:hover { background: #4338ca; border-color: #4338ca; }
    .btn-primary:disabled { opacity: .7; }
  `],
})
export class LoginComponent {
  email    = '';
  password = '';
  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        this.error.set(err?.error?.detail ?? err?.error?.message ?? 'Invalid credentials.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
