import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';

interface CustomerRow {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  ticketCount: number;
  totalSpent: number;
  lastTicketDate: string;
}

interface TicketReport {
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  price: number;
  occurredAt: string;
}

interface PagedResult {
  items: TicketReport[];
  totalCount: number;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">Customers</div>

    <div class="filter-bar">
      <div class="input-group input-group-sm">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" placeholder="Search by email"
               [(ngModel)]="filterEmail" (keyup.enter)="search()" />
      </div>
      <button class="btn btn-primary btn-sm" (click)="search()">
        <i class="bi bi-search me-1"></i> Search
      </button>
      <button class="btn btn-outline-secondary btn-sm" (click)="clear()">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <div class="table-card">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-border text-primary" style="width:32px;height:32px"></div>
        </div>
      } @else {
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Tickets</th>
              <th>Total Spent</th>
              <th>Last Purchase</th>
            </tr>
          </thead>
          <tbody>
            @for (c of customers(); track c.customerEmail) {
              <tr>
                <td><strong>{{ c.customerFirstName }} {{ c.customerLastName }}</strong></td>
                <td class="text-muted">{{ c.customerEmail }}</td>
                <td><span class="badge bg-light text-dark border">{{ c.ticketCount }}</span></td>
                <td>{{ c.totalSpent | number:'1.2-2' }} &euro;</td>
                <td class="text-muted">{{ c.lastTicketDate | date:'dd MMM yyyy' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty-state">No customers found.</td></tr>
            }
          </tbody>
        </table>

        <div class="pagination-bar">
          <span class="text-muted" style="font-size:13px">{{ total() }} result(s)</span>
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
    .filter-bar .input-group { width: 260px; }
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .loading-state { display: flex; justify-content: center; align-items: center; padding: 60px; }
    .empty-state { text-align: center; color: #94a3b8; padding: 48px !important; font-size: 14px; }
    .pagination-bar { display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid #f1f5f9; }
  `]
})
export class CustomersComponent implements OnInit {
  customers = signal<CustomerRow[]>([]);
  total     = signal(0);
  loading   = signal(false);
  page      = 1;
  pageSize  = 20;
  filterEmail = '';

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  search() { this.page = 1; this.load(); }
  clear()  { this.filterEmail = ''; this.search(); }
  goPage(p: number) { this.page = p; this.load(); }
  totalPages() { return Math.max(1, Math.ceil(this.total() / this.pageSize)); }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page).set('pageSize', this.pageSize);
    if (this.filterEmail) params = params.set('customerEmail', this.filterEmail);
    this.http.get<PagedResult>('/api/reporting/v1/reports/tickets', { params }).subscribe({
      next: r => {
        const map = new Map<string, CustomerRow>();
        for (const t of r.items) {
          const key = t.customerEmail;
          if (!map.has(key)) map.set(key, { customerFirstName: t.customerFirstName,
            customerLastName: t.customerLastName, customerEmail: t.customerEmail,
            ticketCount: 0, totalSpent: 0, lastTicketDate: t.occurredAt });
          const row = map.get(key)!;
          row.ticketCount++;
          row.totalSpent += t.price;
          if (t.occurredAt > row.lastTicketDate) row.lastTicketDate = t.occurredAt;
        }
        this.customers.set([...map.values()]);
        this.total.set(map.size);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
