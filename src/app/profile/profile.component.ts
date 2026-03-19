import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../core/services/profile.service';
import { AuthService } from '../core/services/auth.service';
import {
  StudentProfileDTO,
  StudentProfileResponse,
  StudyLevel,
  CollegeType,
  Language
} from '../shared/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  // State
  isLoading = true;
  isSaving = false;
  isEditing = false;
  hasProfile = false;
  errorMessage = '';
  successMessage = '';
  isUploadingAvatar = false;
  avatarPreview: string | null = null;

  // User info from localStorage
  userRole = '';
  userId = '';

  // Profile data
  profile: StudentProfileResponse | null = null;

  // Edit form
  form: StudentProfileDTO = {
    dateOfBirth: '',
    bio: '',
    avatar: '',
    currentStudyLevel: undefined,
    wishedStudyLevel: undefined,
    speciality: '',
    universityYear: undefined,
    languages: '[]',
    budget: undefined,
    collegeType: undefined
  };

  // Languages array (parsed from JSON)
  languages: Language[] = [];

  // Dropdown options
  studyLevels: StudyLevel[] = ['BACHELOR', 'MASTER', 'PHD'];
  collegeTypes: CollegeType[] = ['PUBLIC', 'PRIVATE'];
  languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  universityYears = [1, 2, 3, 4];

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole() || '';
    this.userId = this.authService.getUserId() || '';
    this.loadProfile();
  }

  // ── showLoader = false skips the full-page spinner ──
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

  populateForm(data: StudentProfileResponse): void {
    this.form = {
      dateOfBirth: data.dateOfBirth || '',
      bio: data.bio || '',
      avatar: data.avatar || '',
      currentStudyLevel: data.currentStudyLevel,
      wishedStudyLevel: data.wishedStudyLevel,
      speciality: data.speciality || '',
      universityYear: data.universityYear,
      languages: data.languages || '[]',
      budget: data.budget,
      collegeType: data.collegeType
    };
    this.parseLanguages();
  }

  parseLanguages(): void {
    try {
      this.languages = JSON.parse(this.form.languages || '[]');
    } catch {
      this.languages = [];
    }
  }

  syncLanguages(): void {
    this.form.languages = JSON.stringify(this.languages);
  }

  addLanguage(): void {
    this.languages.push({ name: '', level: 'B1', rank: this.languages.length + 1 });
    this.syncLanguages();
  }

  removeLanguage(index: number): void {
    this.languages.splice(index, 1);
    this.languages.forEach((l, i) => l.rank = i + 1);
    this.syncLanguages();
  }

  updateLanguage(): void {
    this.syncLanguages();
  }

  startEditing(): void {
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.profile) {
      this.populateForm(this.profile);
    }
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.errorMessage = '';
  }

  onSave(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.syncLanguages();

    const action = this.hasProfile
      ? this.profileService.updateProfile(this.form)
      : this.profileService.createProfile(this.form);

    action.subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Profile saved successfully!';
        this.isSaving = false;
        this.isEditing = false;
        // ── No full-page loader on save ──
        this.loadProfile(false);
      },
      error: (err: { error?: { error?: string } }) => {
        this.errorMessage = err?.error?.error || 'Failed to save profile.';
        this.isSaving = false;
      }
    });
  }

  getRoleBadgeClass(): string {
    const role = this.userRole.toUpperCase();
    if (role === 'ADMIN') return 'badge-admin';
    if (role === 'AGENT') return 'badge-agent';
    if (role === 'STUDENT') return 'badge-student';
    return 'badge-guest';
  }

  getInitials(): string {
    const first = this.profile?.user?.firstName || '';
    const last = this.profile?.user?.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '??';
  }

  // ── Resolves avatar URL correctly ──
  getAvatarUrl(): string {
    if (this.avatarPreview) return this.avatarPreview;
    if (!this.profile?.avatar) return '';
    if (this.profile.avatar.startsWith('http')) return this.profile.avatar;
    return 'http://localhost:8080' + this.profile.avatar;
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

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.isUploadingAvatar = true;
    this.errorMessage = '';

    this.profileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.successMessage = 'Avatar updated successfully!';
        this.isUploadingAvatar = false;
        if (this.profile) {
          this.profile.avatar = res.avatarUrl;
        }
        // ── No full-page loader after avatar upload ──
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