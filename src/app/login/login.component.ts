import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LoginPayload } from '../shared/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  form: LoginPayload = {
    identifier: '',
    password: ''
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.identifier || !this.form.password) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.form).subscribe({
      next: (response) => {
        this.authService.setSession(
          response.token,
          response.role,
          response.userId
        );
        const role = response.role.toUpperCase();
        if (role === 'ADMIN') {
          this.router.navigateByUrl('/admin');
        } else if (role === 'AGENT') {
          this.router.navigateByUrl('/agent');
        } else if (role === 'STUDENT') {
          this.router.navigateByUrl('/student');
        } else if (role === 'GUEST' || role === 'USER') {
          this.router.navigateByUrl('/');
          // GUEST has limited access - full student dashboard requires contract registration
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Invalid credentials.';
        this.isSubmitting = false;
      }
    });
  }
}