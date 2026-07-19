import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { Token } from '../../../models';

@Component({
  selector: 'app-admin-tokens',
  imports: [CommonModule, DatePipe],
  templateUrl: './admin-tokens.html',
  styleUrl: './admin-tokens.css',
})
export class AdminTokens {

  private db = inject(DatabaseService);

    private cdr = inject(ChangeDetectorRef); // 2. Inject it


  allTokens: Token[] = [];
  successMessage: string = '';

  ngOnInit() {
    this.refreshData();
  }

  // ==========================================
  // SINGLE TOKEN REVOCATION (The Sniper)
  // ==========================================
  // onRevokeToken(token: Token) {
  //   const confirmRevoke = confirm(`⚠️ Are you sure you want to instantly revoke token: ${token.tokenString}?`);
    
  //   if (confirmRevoke) {
  //     token.status = 'Expired';
  //     this.successMessage = `Security Alert: Token ${token.tokenString} has been manually revoked.`;
  //     this.refreshData();
  //   }
  // }

    onRevokeToken(token: Token) {
    const confirmRevoke = confirm(`⚠️ Are you sure you want to instantly revoke token: ${token.tokenString}?`);
    
    if (confirmRevoke && token.id) {
      // API CALL TO REVOKE
      this.db.revokeToken(token.id).subscribe({
        next: () => {
          this.successMessage = `Security Alert: Token ${token.tokenString} has been manually revoked.`;
          this.refreshData();
        }
      });
    }
  }

  // ==========================================
  // CSV EXPORT ENGINE (The Business Feature)
  // ==========================================
  onExportCSV() {
    // (This remains entirely unchanged, as it uses the allTokens array fetched from the DB!)
    if (this.allTokens.length === 0) {
      alert('The database is empty. No data to export.');
      return;
    }

    const headers = ['Secure Code', 'Student ID', 'Event ID', 'Created At', 'Expires At', 'Status'];

    const rows = this.allTokens.map(t => [
      t.tokenString,
      t.userId,
      t.eventId,
      new Date(t.createdAt).toISOString(),
      new Date(t.expiresAt).toISOString(),
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'TMS_Master_Token_Audit_Log.csv'); 
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.successMessage = 'CSV Export generated and downloaded successfully!';
  }

  // ==========================================
  // THE NUKE (Clear All Tokens)
  // ==========================================
  onDeleteAllTokens() {
    if (this.allTokens.length === 0) {
      alert('The database is already empty.');
      return;
    }

    const confirmNuke = confirm('🚨 DANGER: Are you absolutely sure you want to permanently delete ALL tokens? Please ensure you have exported a CSV backup first. This action CANNOT be undone.');
    
  //   if (confirmNuke) {
  //     this.db.tokens = []; // Wipe the master database array completely
  //     this.successMessage = 'System Alert: All token audit logs have been permanently deleted.';
  //     this.refreshData();
  //   }
  // }

  if (confirmNuke) {
      // API CALL TO WIPE COLLECTION
      this.db.deleteAllTokens().subscribe({
        next: () => {
          this.successMessage = 'System Alert: All token audit logs have been permanently deleted.';
          this.refreshData();
        }
      });
    }
  }

//   private refreshData() {
//     this.allTokens = this.db.tokens;
//   }
// }

private refreshData() {
  this.db.getAllTokens().subscribe(tokens => {
    // 1. Map the ID
    this.allTokens = tokens.map(t => ({
      ...t,
      id: t._id 
    }));
    
    // 2. Force the UI to update
    this.cdr.detectChanges(); 
  });
}
}
