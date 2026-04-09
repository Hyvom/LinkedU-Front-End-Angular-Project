import { Component, HostListener, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);
  scrolled = signal(false);

  loggedIn = false;
  role: string | null = null;
  roleLinks: NavLink[] = [];

  constructor() {
    effect(() => {
      if (this.menuOpen()) {
        document.body.classList.add('drawer-open');
      } else {
        document.body.classList.remove('drawer-open');
      }
    });
  }
  
  publicLinks: NavLink[] = [
    { label: 'Home',         path: '/' },
    { label: 'Destinations', path: '/destinations' },
    { label: 'Services',     path: '/services' },
    { label: 'Blogs',        path: '/blogs' },
    { label: 'About Us',     path: '/about-us' },
  ];

  ngOnInit(): void {
    this.refreshAuthState();
    this.router.events.subscribe(() => this.refreshAuthState());
  }

  private refreshAuthState(): void {
    this.loggedIn = this.authService.isLoggedIn();
    this.role = this.authService.getUserRole();
    this.roleLinks = this.buildRoleLinks(this.role);
  }

  private buildRoleLinks(role: string | null): NavLink[] {
    switch (role) {
      case 'ADMIN':
        return [{ label: 'Admin Panel', path: '/admin' }];
      case 'AGENT':
        return [
          { label: 'Agent Panel', path: '/agent' }
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard',  path: '/student' },
          { label: 'My Profile', path: '/profile/student' },
          { label: 'Chat',       path: '/chat' },
          { label: 'Ticket',     path: '/ticket' }
        ];
      case 'GUEST':
        return [
          { label: 'My Profile', path: '/profile/guest' },
          { label: 'Chat',       path: '/chat' }
        ];
      case 'USER':
        return [
          { label: 'My Profile', path: '/profile' },
          { label: 'Chat',       path: '/chat' }
        ];
      default:
        return [];
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.loggedIn = false;
    this.role = null;
    this.roleLinks = [];
    this.closeMenu();
    this.router.navigate(['/']);
  }
}