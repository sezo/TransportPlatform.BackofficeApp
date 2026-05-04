import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">

      <aside class="sidebar">
        <div class="sidebar-brand">
          <i class="bi bi-bus-front-fill"></i>
          <span>TransportPlatform</span>
        </div>

        <nav class="sidebar-nav">
          <span class="nav-section">Main</span>
          <a class="nav-link" routerLink="/tickets" routerLinkActive="active">
            <i class="bi bi-ticket-perforated"></i> Tickets
          </a>
          <a class="nav-link" routerLink="/customers" routerLinkActive="active">
            <i class="bi bi-people"></i> Customers
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="btn-logout" (click)="logout()">
            <i class="bi bi-box-arrow-left"></i> Logout
          </button>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <span class="topbar-title">Backoffice Administration</span>
          <div class="topbar-user"><i class="bi bi-person-circle"></i> Admin</div>
        </header>
        <main class="content"><router-outlet /></main>
      </div>

    </div>
  `,
  styles: [`
    .app-layout { display: flex; height: 100vh; overflow: hidden; }

    .sidebar { width: var(--sidebar-width); background: #1e1b4b; display: flex; flex-direction: column; flex-shrink: 0; }

    .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 18px 20px;
      font-size: 14px; font-weight: 700; color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar-brand i { font-size: 20px; color: #a5b4fc; }

    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }

    .nav-section { font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .08em; color: #6d6aac; padding: 4px 8px 8px; display: block; }

    .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px;
      border-radius: 8px; color: #c7d2fe; font-size: 13.5px; font-weight: 500;
      text-decoration: none; transition: background .15s; }
    .nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .nav-link.active { background: rgba(255,255,255,0.15); color: #fff; }
    .nav-link i { font-size: 16px; }

    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
    .btn-logout { width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px; background: transparent; border: none;
      color: #c7d2fe; font-size: 13px; cursor: pointer; transition: background .15s; }
    .btn-logout:hover { background: rgba(255,255,255,0.08); color: #fff; }

    .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    .topbar { height: var(--topbar-height); background: #fff; border-bottom: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: space-between; padding: 0 28px; flex-shrink: 0; }
    .topbar-title { font-size: 13px; font-weight: 600; color: #64748b; }
    .topbar-user { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 6px; }

    .content { flex: 1; overflow-y: auto; padding: 28px 32px; background: #f8f9fb; }
  `]
})
export class ShellComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); }
}
