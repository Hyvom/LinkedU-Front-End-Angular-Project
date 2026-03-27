import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ContractRegisterPayload } from '../../shared/models/models';

@Component({
  selector: 'app-contract-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contract-signup.component.html',
  styleUrl: './contract-signup.component.css'
})
export class ContractSignupComponent {
  form: ContractRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    productKey: '',
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

  get passwordStrengthClass(): string {
    const len = this.form.password.length;
    if (len < 6) return 'text-red-500';
    if (len < 9) return 'text-yellow-500';
    return 'text-green-500';
  }
  
  get passwordsMatch(): boolean {
    return this.form.password.trim() === this.form.confirmPassword.trim();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
    return;
}
    if (!this.form.username || !this.form.firstName || !this.form.lastName ||
        !this.form.email || !this.form.password || !this.form.phoneNumber ||
        !this.form.birthDate || !this.form.productKey) {
      this.errorMessage = 'Please fill all required fields including product key.';
      return;
    }

    this.isSubmitting = true;

    this.authService.registerContract(this.form).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Account created! Please check your email to verify your account.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigateByUrl('/login'), 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Registration failed. Invalid product key or existing account.';
        this.isSubmitting = false;
      }
    });
  }
}