import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const profileRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip guard on server-side rendering
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  // Not logged in → go to login
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const role = localStorage.getItem('userRole')?.toUpperCase();

  if (role === 'STUDENT' || role === 'USER') {
    return router.createUrlTree(['/profile/student']);
  }
  if (role === 'GUEST') {
    return router.createUrlTree(['/profile/guest']);
  }
  if (role === 'AGENT') {
    return router.createUrlTree(['/profile/agent']);
  }
  if (role === 'ADMIN') {
    return router.createUrlTree(['/admin']);
  }
  if (role === 'LANGUAGE_TEACHER') {
    return router.createUrlTree(['/teacher']);
  }

  // Unknown role → login
  return router.createUrlTree(['/login']);
};