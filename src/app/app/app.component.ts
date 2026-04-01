import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from '../shared/chatbot-widget/chatbot-widget.component';
import { NavbarComponent } from '../navbar/navbar.component'; // ← ADD THIS LINE

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, ChatbotWidgetComponent, NavbarComponent]
})
export class AppComponent {
  title = 'student-profile';
}