import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { User, UserRole } from '../../shared/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  agents: User[] = [];
  students: User[] = [];

  loading = false;
  errorMsg = '';
  successMsg = '';

  // Role assignment
  selectedRoleMap: { [userId: number]: UserRole } = {};
  assigningRole: number | null = null;

  // Agent assignment
  selectedAgentMap: { [studentId: number]: number } = {};
  assigningAgent: number | null = null;

  readonly roles: UserRole[] = ['ADMIN', 'USER', 'GUEST', 'STUDENT', 'AGENT'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.agents = users.filter(u => u.role === 'AGENT');
        this.students = users.filter(u => u.role === 'STUDENT');
        users.forEach(u => this.selectedRoleMap[u.id] = u.role);
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  assignRole(user: User): void {
    const newRole = this.selectedRoleMap[user.id];
    if (!newRole || newRole === user.role) return;
    this.assigningRole = user.id;
    this.successMsg = '';
    this.errorMsg = '';

    this.adminService.assignRole(user.id, newRole).subscribe({
      next: () => {
        this.successMsg = `Role updated to ${newRole} for ${user.firstName} ${user.lastName}.`;
        this.assigningRole = null;
        this.loadUsers();
      },
      error: () => {
        this.errorMsg = 'Failed to assign role.';
        this.assigningRole = null;
      }
    });
  }

  assignAgent(student: User): void {
    const agentId = this.selectedAgentMap[student.id];
    if (!agentId) return;
    this.assigningAgent = student.id;
    this.successMsg = '';
    this.errorMsg = '';

    this.adminService.assignAgentToStudent(student.id, agentId).subscribe({
      next: () => {
        this.successMsg = `Agent assigned to ${student.firstName} ${student.lastName}.`;
        this.assigningAgent = null;
      },
      error: () => {
        this.errorMsg = 'Failed to assign agent.';
        this.assigningAgent = null;
      }
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      ADMIN: 'badge-admin',
      AGENT: 'badge-agent',
      STUDENT: 'badge-student',
      USER: 'badge-user',
      GUEST: 'badge-guest'
    };
    return map[role] ?? 'badge-user';
  }

  getRoleIcon(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      'ADMIN': 'fas fa-crown',
      'AGENT': 'fas fa-user-tie',
      'STUDENT': 'fas fa-user-graduate',
      'USER': 'fas fa-user',
      'GUEST': 'fas fa-user-slash'
    };
    return icons[role] ?? 'fas fa-user';
  }

  getSelectedRoleClass(role: UserRole): string {
    return `role-${role.toLowerCase()}`;
  }
}
