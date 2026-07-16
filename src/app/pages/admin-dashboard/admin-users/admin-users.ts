import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { Role, User } from '../../../models';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit{

  private db = inject(DatabaseService);

  activeUsers: User[] = [];
  pendingUsers: User[] = [];
  successMessage: string = '';

  // --- SECURITY STATE VARIABLES ---
  // Tracks active users being upgraded
  pendingAdminTargetId: string | null = null;
  pendingAdminRole: Role | null = null; 
  
  // Tracks pending users being approved directly as Admins
  pendingApprovalAdminTargetId: string | null = null;

  ngOnInit() {
    this.refreshData();
  }

  // ==========================================
  // ENGINE 1: NEW USER APPROVALS
  // ==========================================
  
  onApproveUser(user: User, assignedRole: string) {
    const role = assignedRole as Role;

    // SECURITY CHECK: If approving directly as Admin, trigger Double-Tap
    if (role === 'Admin') {
      this.pendingApprovalAdminTargetId = user.id;
      return; // Stop and wait for confirmation!
    }

    // Otherwise, approve normally
    this.executeApproveUser(user, role);
  }

  // The Double-Tap: Yes (For new approvals)
  confirmApprovalAdminGrant(user: User) {
    this.executeApproveUser(user, 'Admin');
    this.cancelApprovalAdminGrant();
  }

  // The Double-Tap: No (For new approvals)
  cancelApprovalAdminGrant() {
    this.pendingApprovalAdminTargetId = null;
  }

  // The Actual Database Update for Approvals
  private executeApproveUser(user: User, assignedRole: Role) {
    user.role = assignedRole;
    user.status = 'Approved';
    this.successMessage = `Approved ${user.name} as a ${assignedRole}.`;
    this.refreshData();
  }

  onRejectUser(user: User) {
    user.status = 'Rejected';
    this.successMessage = `Rejected account request for ${user.name}.`;
    this.refreshData();
  }

  // ==========================================
  // ENGINE 2: ACTIVE ROLE MANAGEMENT
  // ==========================================
  
  onChangeRoleRequest(user: User, newRole: string) {
    const role = newRole as Role;

    if (role === 'Admin' && user.role !== 'Admin') {
      this.pendingAdminTargetId = user.id;
      this.pendingAdminRole = role;
      return; 
    }

    this.executeRoleChange(user, role);
  }

  confirmAdminGrant(user: User) {
    if (this.pendingAdminRole) {
      this.executeRoleChange(user, this.pendingAdminRole);
    }
    this.cancelAdminGrant(); 
  }

  cancelAdminGrant() {
    this.pendingAdminTargetId = null;
    this.pendingAdminRole = null;
  }

  private executeRoleChange(user: User, newRole: Role) {
    user.role = newRole;
    this.successMessage = `Successfully changed ${user.name}'s role to ${newRole}.`;
    this.refreshData();
  }

  // ==========================================
  // DATA SYNC
  // ==========================================
  private refreshData() {
    this.pendingUsers = this.db.users.filter(u => u.status === 'Pending');
    this.activeUsers = this.db.users.filter(u => u.status === 'Approved');
  }
}
