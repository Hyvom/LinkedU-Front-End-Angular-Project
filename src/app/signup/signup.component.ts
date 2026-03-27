import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { GuestRegisterPayload, ContractRegisterPayload } from '../shared/models/models';

type RegistrationType = 'guest' | 'contract';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  registrationType: RegistrationType = 'guest';

  guestForm: GuestRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword:'',
  };

  contractForm: ContractRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    productKey: '',
    confirmPassword :'',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  switchType(type: RegistrationType): void {
    this.registrationType = type;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get currentPassword(): string {
    return this.registrationType === 'guest'
      ? this.guestForm.password
      : this.contractForm.password;
  }

  get passwordStrength(): string {
    const len = this.currentPassword.length;
    if (len === 0) return '';
    if (len < 6) return 'Weak';
    if (len < 9) return 'Medium';
    return 'Strong';
  }

  get passwordStrengthClass(): string {
    const len = this.currentPassword.length;
    if (len < 6) return 'text-red-500';
    if (len < 9) return 'text-yellow-500';
    return 'text-green-500';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    if (this.registrationType === 'guest') {
      const f = this.guestForm;
      if (!f.username || !f.firstName || !f.lastName || !f.email || !f.password || !f.phoneNumber || !f.birthDate) {
        this.errorMessage = 'Please fill all required fields.';
        this.isSubmitting = false;
        return;
      }
      this.authService.registerGuest(f).subscribe({
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
    } else {
      const f = this.contractForm;
      if (!f.username || !f.firstName || !f.lastName || !f.email || !f.password || !f.phoneNumber || !f.birthDate || !f.productKey) {
        this.errorMessage = 'Please fill all required fields including product key.';
        this.isSubmitting = false;
        return;
      }
      this.authService.registerContract(f).subscribe({
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
}