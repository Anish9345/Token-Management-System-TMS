import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-admin-overview',
  imports: [],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.css',
})
export class AdminOverview implements OnInit{
  
  private db = inject(DatabaseService);

  // Dashboard Stats Variables
  totalUsers: number = 0;
  pendingApprovals: number = 0;
  totalEvents: number = 0;
  totalTokens: number = 0;
  activeTokens: number = 0;

  ngOnInit() {
    this.calculateStats();
  }

  // The Math Engine
  private calculateStats() {
    this.totalUsers = this.db.users.length;
    
    // Count how many users are waiting at the door
    this.pendingApprovals = this.db.users.filter(u => u.status === 'Pending').length;
    
    this.totalEvents = this.db.events.length;
    this.totalTokens = this.db.tokens.length;
    
    // Count how many tokens are currently out there and valid
    this.activeTokens = this.db.tokens.filter(t => t.status === 'Active').length;
  }
}
