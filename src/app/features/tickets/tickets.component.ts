import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';

interface TicketReport {
  ticketId: string;
  routeName: string;
  routeOrigin: string;
  routeDestination: string;
  seatNumber: number;
  price: number;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  occurredAt: string;
}

interface PagedResult {
  items: TicketReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">Tickets</div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="input-group input-group-sm">
        <span class="input-group-text"><i class="bi bi-envelope"></i></span>
        <input type="text" class="form-control" placeholder="Customer email"
               [(ngModel)]="filterEmail" (keyup.enter)="search()" />
      </div>
      <div class="input-group input-group-sm">
        <span class="input-group-text"><i class="bi bi-signpost"></i></span>
        <input type="text" class="form-control" placeholder="Route name"
               [(ngModel)]="filterRoute" (keyup.enter)="search()" />
      </div>
      <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="search()" style="width:140px;flex-shrink:0">
        <option value="">All statuses</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <button class="btn btn-primary btn-sm" (click)="search()">
        <i class="bi bi-search me-1"></i> Filter
      </button>
      <button class="btn btn-outline-secondary btn-sm" (click)="clear()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Table card -->
    <div class="table-card">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-border text-primary" style="width:32px;height:32px"></div>
        </div>
      } @else {
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Route</th>
              <th>Route Name</th>
              <th>Seat</th>
              <th>Price</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (t of tickets(); track t.ticketId) {
              <tr>
                <td><strong>{{ t.routeOrigin }}</strong> <span class="text-muted mx-1">&rarr;</span> {{ t.routeDestination }}</td>
                <td>{{ t.routeName }}</td>
                <td>{{ t.seatNumber }}</td>
                <td>{{ t.price | number:'1.2-2' }} &euro;</td>
                <td><span [class]="'badge badge-' + t.status.toLowerCase()">{{ t.status }}</span></td>
                <td>{{ t.customerFirstName }} {{ t.customerLastName }}</td>
                <td class="text-muted">{{ t.customerEmail }}</td>
                <td class="text-muted">{{ t.occurredAt | date:'dd MMM yyyy, HH:mm' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="empty-state">No tickets found.</td></tr>
            }
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination-bar">
          <span class="text-muted" style="font-size:13px">
            {{ total() === 0 ? 'No results' : (page - 1) * pageSize + 1 + ' – ' + min(page * pageSize, total()) + ' of ' + total() }}
          </span>
          <div class="d-flex align-items-center gap-2">
            <select class="form-select form-select-sm" style="width:80px" [(ngModel)]="pageSize" (change)="page=1;load()">
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
              <option [ngValue]="50">50</option>
            </select>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" [class.disabled]="page === 1">
                  <button class="page-link" (click)="goPage(page - 1)">&lsaquo;</button>
                </li>
                <li class="page-item disabled"><span class="page-link">{{ page }} / {{ totalPages() }}</span></li>
                <li class="page-item" [class.disabled]="page >= totalPages()">
                  <button class="page-link" (click)="goPage(page + 1)">&rsaquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
    .filter-bar .input-group { width: 220px; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .loading-state { display: flex; justify-content: center; align-items: center; padding: 60px; }
    .empty-state { text-align: center; color: #94a3b8; padding: 48px !important; font-size: 14px; }
    .pagination-bar { display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid #f1f5f9; }
    .badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .badge-confirmed { background: #dcfce7; color: #15803d; }
    .badge-cancelled { background: #fee2e2; color: #b91c1c; }
    .badge-pending   { background: #fef9c3; color: #a16207; }
  `]
})
export class TicketsComponent implements OnInit {
  tickets = signal<TicketReport[]>([]);
  total   = signal(0);
  loading = signal(false);
  page = 1;
  pageSize = 20;
  filterEmail  = '';
  filterRoute  = '';
  filterStatus = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  search() { this.page = 1; this.load(); }
  clear()  { this.filterEmail = ''; this.filterRoute = ''; this.filterStatus = ''; this.search(); }
  goPage(p: number) { this.page = p; this.load(); }
  totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }
  min(a: number, b: number) { return Math.min(a, b); }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize);
    if (this.filterEmail)  params = params.set('customerEmail', this.filterEmail);
    if (this.filterRoute)  params = params.set('routeName', this.filterRoute);
    if (this.filterStatus) params = params.set('status', this.filterStatus);
    this.http.get<PagedResult>('/api/reporting/v1/reports/tickets', { params }).subscribe({
      next:  r => { this.tickets.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
