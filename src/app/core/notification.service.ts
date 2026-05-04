import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

export interface TicketNotification {
  ticketId: string;
  routeName: string;
  status: string;
  customerEmail: string;
}

export interface CustomerNotification {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  readonly ticketUpserted$ = new Subject<TicketNotification>();
  readonly customerUpserted$ = new Subject<CustomerNotification>();

  private connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/notifications', {
      accessTokenFactory: () => this.auth.getAccessToken() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  constructor(private auth: AuthService) {
    this.connection.on('TicketUpserted', (data: TicketNotification) =>
      this.ticketUpserted$.next(data)
    );
    this.connection.on('CustomerUpserted', (data: CustomerNotification) =>
      this.customerUpserted$.next(data)
    );
  }

  async start(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
      } catch (err) {
        console.error('SignalR connection error:', err);
      }
    }
  }

  async stop(): Promise<void> {
    await this.connection.stop();
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
