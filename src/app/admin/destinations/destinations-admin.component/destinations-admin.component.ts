import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { Destination } from '../../../shared/models/models';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-destinations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './destinations-admin.component.html',
  styleUrl: './destinations-admin.component.css'
})
export class DestinationsAdminComponent implements OnInit {

  // State
  viewMode: ViewMode = 'list';
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  // Data
  destinations: Destination[] = [];
  selectedDestination: Destination | null = null;

  // Form
  form: Destination = this.emptyForm();

  // Delete confirmation
  deleteConfirmId: number | null = null;

  constructor(private readonly destinationService: DestinationService) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  emptyForm(): Destination {
    return {
      countryName: '',
      description: '',
      paragraph: '',
      offers: '',
      universities: ''
    };
  }

  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.getAll().subscribe({
      next: (data) => {
        this.destinations = data;
        this.isLoading = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Failed to load destinations.';
        this.isLoading = false;
      }
    });
  }

  showCreate(): void {
    this.form = this.emptyForm();
    this.viewMode = 'create';
    this.errorMessage = '';
    this.successMessage = '';
  }

  showEdit(dest: Destination): void {
    this.selectedDestination = dest;
    this.form = { ...dest };
    this.viewMode = 'edit';
    this.errorMessage = '';
    this.successMessage = '';
  }

  showList(): void {
    this.viewMode = 'list';
    this.errorMessage = '';
    this.successMessage = '';
    this.deleteConfirmId = null;
  }

  onSave(): void {
    if (!this.form.countryName.trim()) {
      this.errorMessage = 'Country name is required.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    if (this.viewMode === 'create') {
      this.destinationService.create(this.form).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Destination created!';
          this.isSaving = false;
          this.loadDestinations();
          setTimeout(() => this.showList(), 1200);
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err?.error?.message || 'Failed to create destination.';
          this.isSaving = false;
        }
      });
    } else if (this.viewMode === 'edit' && this.selectedDestination?.id) {
      this.destinationService.update(this.selectedDestination.id, this.form).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Destination updated!';
          this.isSaving = false;
          this.loadDestinations();
          setTimeout(() => this.showList(), 1200);
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err?.error?.message || 'Failed to update destination.';
          this.isSaving = false;
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  onDelete(id: number): void {
    this.isDeleting = true;
    this.destinationService.delete(id).subscribe({
      next: () => {
        this.destinations = this.destinations.filter(d => d.id !== id);
        this.deleteConfirmId = null;
        this.isDeleting = false;
        this.successMessage = 'Destination deleted successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Failed to delete destination.';
        this.isDeleting = false;
        this.deleteConfirmId = null;
      }
    });
  }

  getOffersCount(offers: string): number {
    if (!offers?.trim()) return 0;
    return offers.split('\n').filter(o => o.trim()).length;
  }

  getUniversitiesCount(universities: string): number {
    if (!universities?.trim()) return 0;
    return universities.split('\n').filter(u => u.trim()).length;
  }
}