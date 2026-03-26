import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentProfileService } from '../../core/services/agent-profile.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AgentProfileDTO,
  AgentProfileResponse,
  OnlineStatus
} from '../../shared/models/models';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.css'
})
export class AgentProfileComponent implements OnInit {

  isLoading = true;
  isSaving = false;
  isEditing = false;
  hasProfile = false;
  errorMessage = '';
  successMessage = '';
  isUploadingAvatar = false;
  avatarPreview: string | null = null;

  userRole = '';
  userId = '';

  profile: AgentProfileResponse | null = null;

  form: AgentProfileDTO = {
    dateOfBirth: '',
    bio: '',
    avatar: '',
    address: '',
    phoneNumber: '',
    contactName: '',
    email: '',
    availabilityTime: '',
    onlineStatus: undefined
  };

  onlineStatusOptions: OnlineStatus[] = ['ONLINE', 'AWAY', 'OFFLINE'];

  constructor(
    private readonly profileService: AgentProfileService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole() || '';
    this.userId = this.authService.getUserId() || '';
    this.loadProfile();
  }

  loadProfile(showLoader = true): void {
    if (showLoader) this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.hasProfile = true;
        this.populateForm(data);
        this.isLoading = false;
      },
      error: () => {
        this.hasProfile = false;
        this.isLoading = false;
      }
    });
  }

  populateForm(data: AgentProfileResponse): void {
    this.form = {
      dateOfBirth: data.dateOfBirth || '',
      bio: data.bio || '',
      avatar: data.avatar || '',
      address: data.address || '',
      phoneNumber: data.phoneNumber || '',
      contactName: data.contactName || '',
      email: data.email || '',
      availabilityTime: data.availabilityTime || '',
      onlineStatus: data.onlineStatus
    };
  }

  startEditing(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.profile) this.populateForm(this.profile);
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.errorMessage = '';
  }

  onSave(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const action = this.hasProfile
      ? this.profileService.updateProfile(this.form)
      : this.profileService.createProfile(this.form);

    action.subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile saved successfully!';
        this.isSaving = false;
        this.isEditing = false;
        this.loadProfile(false);
      },
      error: (err: { error?: { error?: string } }) => {
        this.errorMessage = err?.error?.error || 'Failed to save profile.';
        this.isSaving = false;
      }
    });
  }

  getRoleBadgeClass(): string {
    return 'badge-agent';
  }

  getInitials(): string {
    const first = this.profile?.user?.firstName || '';
    const last = this.profile?.user?.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '??';
  }

  getStatusClass(): string {
    switch (this.profile?.onlineStatus) {
      case 'ONLINE':  return 'status-online';
      case 'AWAY':    return 'status-away';
      case 'OFFLINE': return 'status-offline';
      default:        return 'status-offline';
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be less than 5MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => { this.avatarPreview = e.target?.result as string; };
    reader.readAsDataURL(file);

    this.isUploadingAvatar = true;
    this.errorMessage = '';

    this.profileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.successMessage = 'Avatar updated successfully!';
        this.isUploadingAvatar = false;
        if (this.profile) this.profile.avatar = res.avatarUrl;
        this.loadProfile(false);
      },
      error: (err: { error?: { error?: string } }) => {
        this.errorMessage = err?.error?.error || 'Failed to upload avatar.';
        this.isUploadingAvatar = false;
        this.avatarPreview = null;
      }
    });
  }
}