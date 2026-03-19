import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

type VerifyState = 'loading' | 'success' | 'already_verified' | 'expired' | 'invalid' | 'error';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {
  state: VerifyState = 'loading';
  message = '';
  countdown = 5;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state = 'invalid';
      this.message = 'No verification token found in the URL.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.state = 'success';
        this.message = res.message || 'Email verified successfully!';
        this.startCountdown();
      },
      error: (err: { error?: { error?: string } }) => {
        const errorMsg = err?.error?.error || '';
        if (errorMsg.toLowerCase().includes('already verified')) {
          this.state = 'already_verified';
          this.message = 'Your email is already verified. You can log in.';
        } else if (errorMsg.toLowerCase().includes('expired')) {
          this.state = 'expired';
          this.message = 'Your verification link has expired. Please register again.';
        } else if (errorMsg.toLowerCase().includes('invalid')) {
          this.state = 'invalid';
          this.message = 'Invalid verification token.';
        } else {
          this.state = 'error';
          this.message = errorMsg || 'Something went wrong. Please try again.';
        }
      }
    });
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval!);
        this.router.navigateByUrl('/login');
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}