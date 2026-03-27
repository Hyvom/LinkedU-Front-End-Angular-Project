import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GuestRegisterPayload } from '../../shared/models/models';

@Component({
  selector: 'app-guest-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guest-signup.component.html',
  styleUrl: './guest-signup.component.css'
})
export class GuestSignupComponent {
  form: GuestRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get passwordStrength(): string {
    const len = this.form.password.length;
    if (len === 0) return '';
    if (len < 6) return 'Weak';
    if (len < 9) return 'Medium';
    return 'Strong';
  }

  get passwordsMatch(): boolean {
    return this.form.password.trim() === this.form.confirmPassword.trim();
  }

  get passwordStrengthClass(): string {
    const len = this.form.password.length;
    if (len < 6) return 'text-red-500';
    if (len < 9) return 'text-yellow-500';
    return 'text-green-500';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.username || !this.form.firstName || !this.form.lastName ||
        !this.form.email || !this.form.password || !this.form.phoneNumber || !this.form.birthDate) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.isSubmitting = true;

    this.authService.registerGuest(this.form).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Account created! Please check your email to verify your account.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigateByUrl('/login'), 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}