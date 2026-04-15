import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { profileRedirectGuard } from '../core/guards/profile-redirect.guard';

// Public pages
import { HomeComponent } from '../home/home.component';
import { ServicesComponent } from '../services/services.component';
import { BlogsComponent } from '../blogs/blogs.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { LoginComponent } from '../login/login.component';
import { VerifyComponent } from '../verify/verify.component';
import { ProfileComponent } from '../profile/profile.component';
import { GuestSignupComponent } from '../signup/guest-signup/guest-signup.component';
import { ContractSignupComponent } from '../signup/contract-signup/contract-signup.component';

// Destinations
import { DestinationsComponent } from '../destinations/destinations.component';
import { AllemagneComponent } from '../destinations/pays/allemagne.component';
import { BelgiqueComponent } from '../destinations/pays/belgique.component';
import { ChineComponent } from '../destinations/pays/chine.component';
import { DubaiComponent } from '../destinations/pays/dubai.component';
import { EspagneComponent } from '../destinations/pays/espagne.component';
import { FranceComponent } from '../destinations/pays/france.component';
import { GeorgieComponent } from '../destinations/pays/georgie.component';
import { ItalieComponent } from '../destinations/pays/italie.component';
import { MalteComponent } from '../destinations/pays/malte.component';
import { RomanieComponent } from '../destinations/pays/romanie.component';
import { SuisseComponent } from '../destinations/pays/suisse.component';
import { TurkiyeComponent } from '../destinations/pays/turkiye.component';

// Protected pages
import { DestinationsAdminComponent } from '../admin/destinations/destinations-admin.component/destinations-admin.component';
import { AdminComponent } from '../admin/admin.component';
//profile routes
import { StudentProfileComponent } from '../student/student.component';
import { GuestProfileComponent } from '../profile/guest-profile.component/guest-profile.component';
import { AgentProfileComponent } from '../profile/agent-profile.component/agent-profile.component';
import { AgentComponent } from '../agent/agent.component';
import { LanguageTeacherComponent } from '../language-teacher/language-teacher.component';

//Ticket
import { TicketComponent } from '../ticket/ticket.component';

//Chat
import { ChatComponent } from '../chat/chat.component';

export const routes: Routes = [
  // ── Public ──────────────────────────────────────────
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'signup', redirectTo: 'signup/guest', pathMatch: 'full' },
  { path: 'signup/guest', component: GuestSignupComponent },
  { path: 'signup/contract', component: ContractSignupComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'about-us', component: AboutUsComponent },

  // ── Destinations (public) ────────────────────────────
  { path: 'destinations', component: DestinationsComponent },
  { path: 'destinations/pays/france', component: FranceComponent },
  { path: 'destinations/pays/romanie', component: RomanieComponent },
  { path: 'destinations/pays/dubai', component: DubaiComponent },
  { path: 'destinations/pays/italie', component: ItalieComponent },
  { path: 'destinations/pays/turkiye', component: TurkiyeComponent },
  { path: 'destinations/pays/espagne', component: EspagneComponent },
  { path: 'destinations/pays/belgique', component: BelgiqueComponent },
  { path: 'destinations/pays/allemagne', component: AllemagneComponent },
  { path: 'destinations/pays/chine', component: ChineComponent },
  { path: 'destinations/pays/suisse', component: SuisseComponent },
  { path: 'destinations/pays/georgie', component: GeorgieComponent },
  { path: 'destinations/pays/malte', component: MalteComponent },

  // ── profiles ───────────────────────────────────────
  { path: 'profile/student', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/guest',   component: GuestProfileComponent,  canActivate: [authGuard] },
  { path: 'profile/agent',   component: AgentProfileComponent,  canActivate: [authGuard] },
  { path: 'profile',         canActivate: [profileRedirectGuard], component: StudentProfileComponent },
  
  // ── Admin only ───────────────────────────────────────
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'statistics', pathMatch: 'full' },
      {
        path: 'statistics',
        loadComponent: () =>
          import('../admin/statistics.component/statistics.component').then(m => m.AdminStatisticsComponent)
      },
      {
        path: 'product-keys',
        loadComponent: () =>
          import('../admin/product-keys.component/product-keys.component').then(m => m.ProductKeysComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../admin/users.component/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'destinations',
        loadComponent: () =>
          import('../admin/destinations/destinations-admin.component/destinations-admin.component')
            .then(m => m.DestinationsAdminComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('../admin/quizzes.component/quizzes.component')
            .then(m => m.QuizzesComponent)
      }
    ]
  },

  // ── Student/User ─────────────────────────────────────
  {
    path: 'student',
    component: StudentProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT', 'USER', 'GUEST'] }
  },
  
  //Agent Dashboard
  {
    path: 'agent',
    component: AgentComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AGENT'] }
  },

  {
    path: 'teacher',
    component: LanguageTeacherComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LANGUAGE_TEACHER'] }
  },

  //Chat
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard]
  },

  //Ticket
  {
    path: 'ticket',
    component: TicketComponent,
    canActivate: [authGuard]
  },

  // ── Fallback ─────────────────────────────────────────
  { path: '**', redirectTo: '' }
];