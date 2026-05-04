import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

interface Route {
  id: string;
  origin: string;
  destination: string;
  name: string;
  capacity: number;
}

interface BuyTicketRequest {
  routeId: string;
  seatColumn: number;
  seatRow: number;
}

interface BuyTicketResponse {
  ticketId: string;
  status: string;
  message: string;
}

@Component({
  selector: 'app-buy-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">Buy Ticket</div>

      <div class="buy-ticket-wrapper">
        <!-- Routes Selection -->
        <div class="routes-section">
          <h3 class="section-title">Available Routes</h3>

          <div *ngIf="loading()">
            <div class="alert alert-info">
              <i class="bi bi-hourglass-split"></i> Loading routes...
            </div>
          </div>

          <div *ngIf="error()">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-circle"></i> {{ error() }}
            </div>
          </div>

          <div class="routes-grid">
            <div *ngFor="let route of routes()" 
                 [class.route-card-selected]="selectedRoute() === route.id"
                 (click)="selectRoute(route)"
                 class="route-card">
              <div class="route-name">{{ route.name }}</div>
              <div class="route-details">
                <span><i class="bi bi-geo-alt"></i> {{ route.origin }} → {{ route.destination }}</span>
              </div>
              <div class="route-capacity">
                <i class="bi bi-people"></i> Capacity: {{ route.capacity }}
              </div>
            </div>
          </div>
        </div>

        <!-- Seat Selection -->
        <div *ngIf="selectedRoute()">
          <div class="seat-selection-section">
            <h3 class="section-title">Select Seat</h3>

            <div class="seat-grid">
              <div class="seat-input-group">
                <label for="seatRow">Row:</label>
                <input type="number" id="seatRow" class="form-control" 
                       [(ngModel)]="rowInput" [disabled]="purchasing()"
                       min="1" max="20" />
              </div>
              <div class="seat-input-group">
                <label for="seatColumn">Column:</label>
                <input type="number" id="seatColumn" class="form-control" 
                       [(ngModel)]="colInput" [disabled]="purchasing()"
                       min="1" max="4" />
              </div>
            </div>

            <div class="seat-preview">
              <div *ngIf="rowInput && colInput" class="preview-text">
                Selected: Row <strong>{{ rowInput }}</strong>, Seat <strong>{{ colInput }}</strong>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn btn-primary" 
                    (click)="buyTicket()"
                    [disabled]="!rowInput || !colInput || purchasing()"
                    [class.btn-loading]="purchasing()">
              <span *ngIf="!purchasing()">
                <i class="bi bi-credit-card"></i> Buy Ticket
              </span>
              <span *ngIf="purchasing()">
                <i class="bi bi-hourglass-split"></i> Processing...
              </span>
            </button>
            <button class="btn btn-secondary" 
                    (click)="clearSelection()"
                    [disabled]="purchasing()">
              Cancel
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage()">
          <div class="alert alert-success">
            <i class="bi bi-check-circle"></i> 
            <div>
              <strong>Success!</strong> Ticket purchased successfully.
              <div class="ticket-id">Ticket ID: {{ successMessage() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }

    .page-header {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 24px;
    }

    .buy-ticket-wrapper {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .route-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .route-card:hover {
      border-color: #3b82f6;
      background: #f0f9ff;
    }

    .route-card-selected {
      border-color: #3b82f6;
      background: #dbeafe;
    }

    .route-name {
      font-size: 15px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .route-details {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .route-capacity {
      font-size: 12px;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .seat-selection-section {
      margin: 32px 0;
      padding: 24px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .seat-grid {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .seat-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .seat-input-group label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      width: 120px;
    }

    .form-control:disabled {
      background: #f3f4f6;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .seat-preview {
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .preview-text {
      font-size: 13px;
      color: #374151;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d1d5db;
    }

    .btn-loading {
      opacity: 0.8;
    }

    .alert {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
    }

    .alert i {
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .alert-info {
      background: #dbeafe;
      color: #1e40af;
      border-left: 3px solid #3b82f6;
    }

    .alert-danger {
      background: #fee2e2;
      color: #991b1b;
      border-left: 3px solid #ef4444;
    }

    .alert-success {
      background: #dcfce7;
      color: #166534;
      border-left: 3px solid #22c55e;
    }

    .ticket-id {
      margin-top: 8px;
      font-family: monospace;
      font-size: 12px;
      background: rgba(0,0,0,0.05);
      padding: 8px;
      border-radius: 4px;
    }
  `]
})
export class BuyTicketComponent implements OnInit {
  private readonly http = inject(HttpClient);

  routes = signal<Route[]>([]);
  selectedRoute = signal<string | null>(null);
  rowInput: number | null = null;
  colInput: number | null = null;
  loading = signal(true);
  error = signal<string | null>(null);
  purchasing = signal(false);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Route[]>('/api/ticketing/routes').subscribe({
      next: (routes) => {
        this.routes.set(routes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load routes:', err);
        this.error.set('Failed to load routes. Please try again.');
        this.loading.set(false);
      }
    });
  }

  selectRoute(route: Route) {
    this.selectedRoute.set(route.id);
    this.successMessage.set(null);
    this.rowInput = null;
    this.colInput = null;
  }

  clearSelection() {
    this.selectedRoute.set(null);
    this.rowInput = null;
    this.colInput = null;
    this.successMessage.set(null);
  }

  buyTicket() {
    const routeId = this.selectedRoute();
    const row = this.rowInput;
    const column = this.colInput;

    if (!routeId || !row || !column) {
      this.error.set('Please select a route and seat.');
      return;
    }

    this.purchasing.set(true);
    this.error.set(null);

    const request: BuyTicketRequest = {
      routeId,
      seatRow: row,
      seatColumn: column
    };

    this.http.post<BuyTicketResponse>('/api/ticketing/tickets', request).subscribe({
      next: (response) => {
        this.successMessage.set(response.ticketId);
        this.purchasing.set(false);
        setTimeout(() => this.clearSelection(), 3000);
      },
      error: (err) => {
        console.error('Failed to buy ticket:', err);
        this.error.set(err.error?.message || 'Failed to purchase ticket. Please try again.');
        this.purchasing.set(false);
      }
    });
  }
}
